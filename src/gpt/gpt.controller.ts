import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import {
  AudioToTextDto,
  ImageGenerationDto,
  OrthographyDto,
  ProsConsDiscusserDto,
  TexToAudioDto,
  TranslateDto,
  imageVariationDto,
} from './dtos';
import { GptService } from './gpt.service';

// El controlador recibe una solicitud y emitir una respuesta
@Controller('gpt')
export class GptController {
  // Esto es una inyecion de dependencias
  constructor(private readonly gptService: GptService) {}

  @Post('orthography-check')
  orthographycheck(@Body() orthographyDto: OrthographyDto) {
    return this.gptService.orthographycheck(orthographyDto);
  }

  @Post('pros-cons-discusser')
  prosConsDicusser(@Body() prosConsDiscusserDto: ProsConsDiscusserDto) {
    return this.gptService.prosConsDicusser(prosConsDiscusserDto);
  }

  @Post('pros-cons-discusser-stream')
  async prosConsDicusserStream(
    @Body() prosConsDiscusserDto: ProsConsDiscusserDto,
    @Res() res: Response,
  ) {
    const stream =
      await this.gptService.prosConsDicusserStream(prosConsDiscusserDto);

    res.setHeader('Content-Type', 'aplication/json');
    res.status(HttpStatus.OK);

    // Esto es porque son varias emiciones de nuestro string
    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content || '';
      // console.log(piece);

      res.write(piece);
    }

    res.end();
  }

  @Post('translate')
  handlerTranslate(@Body() translateDto: TranslateDto) {
    return this.gptService.handlerTranslate(translateDto);
  }

  @Post('text-to-audio')
  async textToAudio(
    @Body() textToAudioDto: TexToAudioDto,
    @Res() res: Response,
  ) {
    const filePath = await this.gptService.textToAudio(textToAudioDto);

    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Get('text-to-audio/:fileId')
  async textToAudioGetter(
    @Res() res: Response,
    @Param('fileId') fileId: string,
  ) {
    const filePath = await this.gptService.textToAudioGetter(fileId);

    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  // Aca usamos un interceptors
  @Post('audio-to-text')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './generated/uploads',
        filename: (req, file, callback) => {
          // Lo corto por los puntos y ahi agarro la ultima posicion
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${new Date().getTime()}.${fileExtension}`; //123123123.mp3 tenemos algo asi
          return callback(null, fileName);
        },
      }),
    }),
  )
  async audioTotext(
    @UploadedFile(
      // Los pipes en nestjs permiten hacer una transformacion
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            // Aca en el maxSize le indicamos que no sea mayor a 5mb
            maxSize: 1000 * 1024 * 5,
            message: 'File es bigger than 5 mb',
          }),
          new FileTypeValidator({
            fileType: 'audio/*',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() audioToTextDto: AudioToTextDto,
  ) {
    // console.log({ file });

    return this.gptService.audioTotext(file, audioToTextDto);
  }

  @Post('image-generation')
  async imageGeneration(@Body() imageGenerationDto: ImageGenerationDto) {
    return await this.gptService.imageGeneration(imageGenerationDto);
  }

  @Get('image-generation/:filename')
  async getGeneratedImage(
    @Res() res: Response,
    @Param('filename') fileName: string,
  ) {
    const filePath = this.gptService.getGeneratedImage(fileName);
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Post('image-variation')
  async imageVariation(@Body() imageVariationDto: imageVariationDto) {
    return await this.gptService.generateImageVariation(imageVariationDto);
  }
}
