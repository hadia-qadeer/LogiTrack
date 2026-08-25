import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, MinLength, IsEnum } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @MinLength(6)
  password!: string;
}

export class RegisterShipperDto {
  @ApiProperty({ example: 'acme@logistics.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Acme Logistics Inc' })
  name!: string;

  @ApiPropertyOptional({ example: '555-1234' })
  phone?: string;
}

export class RegisterDriverDto {
  @ApiProperty({ example: 'john.driver@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John Smith' })
  name!: string;

  @ApiProperty({ example: '555-5678' })
  phone!: string;

  @ApiProperty({ example: 'Box Truck' })
  vehicleType!: string;

  @ApiProperty({ example: 'ABC-1234' })
  licensePlate!: string;

  @ApiProperty({ example: 5000 })
  capacity!: number;
}

export class UserProfileDto {
  id!: string;
  email!: string;
  name!: string;
  role!: Role;
  phone?: string;
  approved!: boolean;
  approvedAt?: Date;
  rejectionReason?: string;
}

export class DriverProfileDto extends UserProfileDto {
  vehicleInfo?: {
    vehicleType: string;
    licensePlate: string;
    capacity: number;
    verified: boolean;
  };
}

export class LoginResponseDto {
  access_token!: string;
  user!: UserProfileDto;
}

export class RegisterResponseDto {
  token!: string;
  user!: UserProfileDto;
}