import * as fs from 'fs';
import OpenAI from 'openai';
import * as path from 'path';

interface Options {
  prompt: string;
  voice?: string;
}

export const texToAudioUseCase = async (
  openai: OpenAI,
  { prompt, voice }: Options,
) => {
  const voices = {
    nova: 'nova',
    alloy: 'alloy',
    echo: 'echo',
    fable: 'fable',
    onyx: 'onyx',
    shimmer: 'shimmer',
  };

  const selectedVoice = voices[voice] ?? 'nova';

  const folderPath = path.resolve(__dirname, '../../../generated/audios/');
  // Ojo porque si esto está en prod y dos personas quieren subir un audio al mismo tiempo pueden
  // chocar y generaria un problema pero para solucionarlo podemos hacerlo con el id de cada usuario
  const speechFile = path.resolve(`${folderPath}/${new Date().getTime()}.mp3`);

  // Es decir que si no existiera ese directorio que vaya recursivamente y los cree todos
  fs.mkdirSync(folderPath, { recursive: true });

  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: selectedVoice,
    input: prompt,
    response_format: 'mp3',
  });

  //   console.log(mp3);
  // Esto nos permite tener la info de nuestro binario
  const buffer = Buffer.from(await mp3.arrayBuffer());
  fs.writeFileSync(speechFile, buffer);

  return speechFile;
};
