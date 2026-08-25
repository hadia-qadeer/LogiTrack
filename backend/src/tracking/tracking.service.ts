import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async getTrackingHistory(shipmentId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new BadRequestException('Shipment not found');
    }

    const tracking = await this.prisma.shipmentTracking.findMany({
      where: { shipmentId },
      include: {
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      shipmentId,
      currentStatus: shipment.status,
      fromCity: shipment.fromCity,
      toCity: shipment.toCity,
      createdAt: shipment.createdAt,
      expectedDelivery: shipment.expectedDelivery,
      deliveredAt: shipment.deliveredAt,
      history: tracking,
    };
  }

  async getLatestTracking(shipmentId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new BadRequestException('Shipment not found');
    }

    const latest = await this.prisma.shipmentTracking.findFirst({
      where: { shipmentId },
      include: {
        updatedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return latest;
  }
}