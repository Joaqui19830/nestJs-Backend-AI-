import { IsOptional, IsString } from 'class-validator';

export class TexToAudioDto {
  @IsString()
  readonly prompt: string;

  @IsString()
  @IsOptional()
  readonly voice?: string;
}
