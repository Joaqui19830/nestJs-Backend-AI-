import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { QuestionDto } from './dtos/question.dto';
import {
  checkCompleteStatusUseCase,
  createMessageUseCase,
  createRunUseCase,
  createdThreadUseCase,
  getMessageListUseCase,
} from './use-cases';

@Injectable()
export class SamAssistantService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async createdThread() {
    return await createdThreadUseCase(this.openai);
  }

  async userQuestion(questionDto: QuestionDto) {
    const { threadId, question } = questionDto;

    // Creamos el msj
    const message = await createMessageUseCase(this.openai, {
      threadId,
      question,
    });

    // Creamos el run
    const run = await createRunUseCase(this.openai, { threadId });

    // Verificamos el run y lanza un error
    await checkCompleteStatusUseCase(this.openai, {
      runId: run.id,
      threadId: threadId,
    });

    // Tenemos todos los msj y lanza un thread
    const messages = await getMessageListUseCase(this.openai, { threadId });

    return messages.reverse();
  }
}
