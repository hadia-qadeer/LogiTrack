import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateVehicleDto {
  vehicleType!: string;
  licensePlate!: string;
  capacity!: number;
  documentUrl?: string;
}

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateVehicle(driverId: string, dto: CreateVehicleDto) {
    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
    });

    if (!driver || driver.role !== 'DRIVER') {
      throw new BadRequestException('Only drivers can have vehicle info');
    }

    return this.prisma.vehicleInfo.upsert({
      where: { driverId },
      create: {
        driverId,
        vehicleType: dto.vehicleType,
        licensePlate: dto.licensePlate,
        capacity: dto.capacity,
        documentUrl: dto.documentUrl,
      },
      update: {
        vehicleType: dto.vehicleType,
        licensePlate: dto.licensePlate,
        capacity: dto.capacity,
        documentUrl: dto.documentUrl,
      },
    });
  }

  async getVehicleInfo(driverId: string) {
    const vehicle = await this.prisma.vehicleInfo.findUnique({
      where: { driverId },
    });

    if (!vehicle) {
      throw new BadRequestException('Vehicle info not found');
    }

    return vehicle;
  }
}