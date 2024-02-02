import * as fs from 'fs';
import OpenAI from 'openai';
import { downloadBase64ImageAsPng, downloadImageAsPng } from 'src/helpers';

interface Options {
  prompt: string;
  originalImage?: string;
  maskImage?: string;
}

export const imageGenerationUseCase = async (
  openai: OpenAI,
  options: Options,
) => {
  const { prompt, originalImage, maskImage } = options;
  // console.log({prompt, originalImage, maskImage});

  //   TODO: Verificar originalImage
  if (!originalImage || !maskImage) {
    const response = await openai.images.generate({
      prompt: prompt,
      model: 'dall-e-2',
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    });

    // TODO: Guardar la imagen en FS.
    const fileName = await downloadImageAsPng(response.data[0].url);
    const url = `${process.env.SERVER_URL}gpt/image-generation/${fileName}`;
    //   console.log(response);

    return {
      url: url, // localhost:3000/gpt/image-generation/170689009767032.png
      openAIUrl: response.data[0].url,
      revised_prompt: response.data[0].revised_prompt,
    };
  }

  // originalImagePath = localhost:3000/gpt/image-generation/1706890097670.png
  // maskImage = Base64; asdaslñkdñlkeokañoekd
  // Aca lo que vamos a tener es el url completo es decir el url del archivo
  // para poder trabajarlo en el frontend
  const pngImagePath = await downloadImageAsPng(originalImage, true);
  const maskPath = await downloadBase64ImageAsPng(maskImage, true);

  const response = await openai.images.edit({
    model: 'dall-e-2',
    prompt: prompt,
    image: fs.createReadStream(pngImagePath),
    mask: fs.createReadStream(maskPath),
    n: 1,
    size: '1024x1024',
    response_format: 'url',
  });

  const fileName = await downloadImageAsPng(response.data[0].url);
  const url = `${process.env.SERVER_URL}gpt/image-generation/${fileName}`;

  return {
    url: url, //localhost:3000/gpt/image-generation/170689009767034.png
    openAIUrl: response.data[0].url,
    revised_prompt: response.data[0].revised_prompt,
  };
};
