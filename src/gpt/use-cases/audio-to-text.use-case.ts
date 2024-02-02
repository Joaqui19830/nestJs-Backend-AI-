import * as fs from 'fs';

import OpenAI from 'openai';

interface Options {
  prompt?: string;
  audioFile: Express.Multer.File;
}

export const audioTotextUseCase = async (openai: OpenAI, options: Options) => {
  const { prompt, audioFile } = options;

  const resp = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    // Aca le mandamos el file
    file: fs.createReadStream(audioFile.path),
    prompt: prompt, // Tiene que ser el mismo idioma del audio
    language: 'es',
    // response_format: 'vtt',
    response_format: 'verbose_json',
  });

  return resp;
};
