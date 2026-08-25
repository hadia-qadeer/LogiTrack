import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SelectDriverDto {
  @ApiProperty({ example: 'application-123' })
  @IsString()
  applicationId!: string;
}