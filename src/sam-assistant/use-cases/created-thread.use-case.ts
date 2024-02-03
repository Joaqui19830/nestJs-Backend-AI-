import OpenAI from 'openai';

export const createdThreadUseCase = async (openai: OpenAI) => {
  const { id } = await openai.beta.threads.create();

  return { id };
};
