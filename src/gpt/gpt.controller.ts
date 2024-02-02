import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  OrthographyDto,
  ProsConsDiscusserDto,
  TexToAudioDto,
  TranslateDto,
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
}
