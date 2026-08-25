import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';

export class CreateApplicationDto {
  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  proposedPrice?: number;

  @ApiPropertyOptional({
    example: 'I am in the area and can pick up today',
  })
  @IsOptional()
  @IsString()
  message?: string;
}