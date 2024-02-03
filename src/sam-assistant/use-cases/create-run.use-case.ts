import OpenAI from 'openai';

interface Options {
  threadId: string;
  assistantId?: string;
}

export const createRunUseCase = async (openai: OpenAI, options: Options) => {
  const { threadId, assistantId = 'asst_miLz73LHQ9GTNyiltjuRaOok' } = options;

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    // instructions  //OJO!!  Lo que sea que se escriba lo sobreescribe
  });

  console.log(run);

  return run;
};
