import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto, UpdateShipmentStatusDto } from './dto/create-shipment.dto';

@Injectable()
export class ShipmentsService {
  constructor(private prisma: PrismaService) {}

  async createShipment(dto: CreateShipmentDto, userId: string) {
    if (dto.fromCity.trim() === dto.toCity.trim()) {
      throw new BadRequestException('From and To cities must be different');
    }

    if (dto.weight <= 0 || dto.value <= 0) {
      throw new BadRequestException('Weight and value must be greater than 0');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Must have at least 1 item');
    }

    const shipper = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!shipper || shipper.role !== 'SHIPPER') {
      throw new BadRequestException('Only shippers can create shipments');
    }

    if (!shipper.approved) {
      throw new BadRequestException(
        'Your account must be approved by admin before posting shipments',
      );
    }

    const expectedDelivery = dto.expectedDelivery
      ? new Date(dto.expectedDelivery)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (Number.isNaN(expectedDelivery.getTime())) {
      throw new BadRequestException(
        'expectedDelivery must be a valid ISO date, e.g., 2026-09-01T10:00:00.000Z',
      );
    }

    const shipment = await this.prisma.shipment.create({
      data: {
        fromCity: dto.fromCity,
        toCity: dto.toCity,
        weight: dto.weight,
        value: dto.value,
        items: dto.items,
        status: 'AVAILABLE',
        createdById: userId,
        expectedDelivery,
      },
    });

    return shipment;
  }

  async getShipperShipments(shipperId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const total = await this.prisma.shipment.count({
      where: { createdById: shipperId },
    });

    const shipments = await this.prisma.shipment.findMany({
      where: { createdById: shipperId },
      include: {
        driver: {
          select: { id: true, name: true, phone: true },
        },
        applications: {
          include: {
            driver: {
              select: { id: true, name: true, phone: true, vehicleInfo: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return {
      data: shipments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDriverShipments(driverId: string) {
    return this.prisma.shipment.findMany({
      where: { driverId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, phone: true },
        },
        tracking: {
          include: {
            updatedBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getShipmentById(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        driver: {
          select: { id: true, name: true, phone: true, vehicleInfo: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, phone: true },
        },
        tracking: {
          include: {
            updatedBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        applications: {
          include: {
            driver: {
              select: { id: true, name: true, phone: true, vehicleInfo: true },
            },
          },
          where: { status: 'PENDING' },
        },
      },
    });

    if (!shipment) {
      throw new BadRequestException('Shipment not found');
    }

    return shipment;
  }

  async updateShipmentStatus(
    shipmentId: string,
    dto: UpdateShipmentStatusDto,
    userId: string,
  ) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new BadRequestException('Shipment not found');
    }

    if (shipment.driverId !== userId) {
      throw new ForbiddenException('Only assigned driver can update shipment');
    }

    const validTransitions: Record<string, string[]> = {
      AVAILABLE: [],
      ASSIGNED: ['IN_TRANSIT'],
      IN_TRANSIT: ['DELIVERED', 'FAILED'],
      DELIVERED: [],
      FAILED: [],
      CANCELLED: [],
    };

    if (!validTransitions[shipment.status].includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${shipment.status} to ${dto.status}`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedShipment = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: dto.status as any,
          deliveredAt: dto.status === 'DELIVERED' ? new Date() : null,
        },
      });

      const tracking = await tx.shipmentTracking.create({
        data: {
          shipmentId,
          status: dto.status as any,
          location: dto.location,
          latitude: dto.latitude,
          longitude: dto.longitude,
          notes: dto.notes,
          updatedById: userId,
        },
      });

      return { shipment: updatedShipment, tracking };
    });

    return result;
  }

  async deleteShipment(shipmentId: string, userId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new BadRequestException('Shipment not found');
    }

    if (shipment.createdById !== userId) {
      throw new ForbiddenException('Only shipment creator can delete');
    }

    if (shipment.status !== 'AVAILABLE') {
      throw new BadRequestException('Can only delete shipments in AVAILABLE status');
    }

    await this.prisma.shipment.delete({
      where: { id: shipmentId },
    });

    return { message: 'Shipment deleted successfully' };
  }
}