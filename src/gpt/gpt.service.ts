// Importaciones de Node
import * as fs from 'fs';
import * as path from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';
import OpenAI from 'openai';
import {
  AudioToTextDto,
  ImageGenerationDto,
  OrthographyDto,
  ProsConsDiscusserDto,
  TexToAudioDto,
  TranslateDto,
  imageVariationDto,
} from './dtos';
import {
  audioTotextUseCase,
  imageGenerationUseCase,
  imageVariationUseCase,
  orthographyCheckUseCase,
  prosConsDicusserStreamUseCase,
  prosConsDicusserUseCase,
  texToAudioUseCase,
  translateUseCase,
} from './use-cases';

// Los servicios van a verse como un lugar centralizado para mantener informacion
// Y son los que van a terminar llamando los casos de uso
@Injectable()
export class GptService {
  // Generamos la instancia y la mandamos en nuesto caso de uso
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Solo va a llamar casos de uso

  async orthographycheck(orthographyDto: OrthographyDto) {
    return await orthographyCheckUseCase(this.openai, {
      prompt: orthographyDto.prompt,
    });
  }

  async prosConsDicusser({ prompt }: ProsConsDiscusserDto) {
    return await prosConsDicusserUseCase(this.openai, { prompt });
  }

  async prosConsDicusserStream({ prompt }: ProsConsDiscusserDto) {
    return await prosConsDicusserStreamUseCase(this.openai, { prompt });
  }
  async handlerTranslate({ prompt, lang }: TranslateDto) {
    return await translateUseCase(this.openai, { prompt, lang });
  }
  async textToAudio({ prompt, voice }: TexToAudioDto) {
    return await texToAudioUseCase(this.openai, { prompt, voice });
  }

  async textToAudioGetter(fileId: string) {
    const filePath = path.resolve(
      __dirname,
      '../../generated/audios/',
      `${fileId}.mp3`,
    );

    const wasFound = fs.existsSync(filePath);

    // Este error automaticamente regresa un 404 si no existe
    if (!wasFound) throw new NotFoundException(`file ${fileId} not found`);

    return filePath;
  }

  async audioTotext(
    audioFile: Express.Multer.File,
    audioToTextDto: AudioToTextDto,
  ) {
    const { prompt } = audioToTextDto;

    return await audioTotextUseCase(this.openai, { audioFile, prompt });
  }

  async imageGeneration(imageGenerationDto: ImageGenerationDto) {
    return await imageGenerationUseCase(this.openai, { ...imageGenerationDto });
  }

  getGeneratedImage(fileName: string) {
    const filePath = path.resolve('./', './generated/images/', fileName);

    const exists = fs.existsSync(filePath);

    // Este error automaticamente regresa un 404 si no existe
    if (!exists) throw new NotFoundException(`File not found`);

    // console.log(filePath);

    return filePath;
  }

  async generateImageVariation({ baseImage }: imageVariationDto) {
    return await imageVariationUseCase(this.openai, { baseImage });
  }
}
