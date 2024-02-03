import { Body, Controller, Post } from '@nestjs/common';
import { QuestionDto } from './dtos/question.dto';
import { SamAssistantService } from './sam-assistant.service';

@Controller('sam-assistant')
export class SamAssistantController {
  constructor(private readonly samAssistantService: SamAssistantService) {}

  @Post('created-thread')
  async createThread() {
    return await this.samAssistantService.createdThread();
  }
  @Post('user-question')
  async userQuestion(@Body() questionDto: QuestionDto) {
    return await this.samAssistantService.userQuestion(questionDto);
  }
}
