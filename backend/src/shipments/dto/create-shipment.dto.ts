import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsPositive, IsOptional, IsISO8601 } from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty({ example: 'New York' })
  @IsString()
  fromCity!: string;

  @ApiProperty({ example: 'Los Angeles' })
  @IsString()
  toCity!: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @IsPositive()
  weight!: number;

  @ApiProperty({ example: 5000.50 })
  @IsNumber()
  @IsPositive()
  value!: number;

  @ApiProperty({
    type: 'array',
    example: [{ name: 'Laptops', quantity: 10, description: 'Dell XPS' }],
  })
  @IsArray()
  items!: Array<{
    name: string;
    quantity: number;
    description?: string;
  }>;

  @ApiPropertyOptional({ example: '2026-09-01T10:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  expectedDelivery?: string;
}

export class UpdateShipmentStatusDto {
  @ApiProperty({ example: 'IN_TRANSIT' })
  @IsString()
  status!: string;

  @ApiProperty({ example: 'Chicago, IL' })
  @IsString()
  location!: string;

  @ApiPropertyOptional({ example: '45.1234' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: '-87.5678' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Running ahead of schedule' })
  @IsOptional()
  @IsString()
  notes?: string;
}