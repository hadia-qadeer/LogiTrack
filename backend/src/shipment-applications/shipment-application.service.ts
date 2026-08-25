import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ShipmentApplicationService {
  constructor(private prisma: PrismaService) {}

  async getAvailableShipments(
    page: number = 1,
    limit: number = 10,
    filters: any = {},
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'AVAILABLE',
    };

    if (filters.fromCity) where.fromCity = filters.fromCity;
    if (filters.toCity) where.toCity = filters.toCity;

    const total = await this.prisma.shipment.count({ where });

    const shipments = await this.prisma.shipment.findMany({
      where,
      skip,
      take: limit,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
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

  async applyForShipment(
    shipmentId: string,
    driverId: string,
    dto: CreateApplicationDto,
  ) {
    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
    });

    if (!driver || driver.role !== 'DRIVER') {
      throw new BadRequestException('Driver not found');
    }

    if (!driver.approved) {
      throw new BadRequestException('Driver must be approved before applying');
    }

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new BadRequestException('Shipment not found');
    }

    if (shipment.status !== 'AVAILABLE') {
      throw new BadRequestException('Shipment is not available for applications');
    }

    const existingApplication = await this.prisma.shipmentApplication.findUnique({
      where: {
        shipmentId_driverId: {
          shipmentId,
          driverId,
        },
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You already applied for this shipment');
    }

    const application = await this.prisma.shipmentApplication.create({
      data: {
        shipmentId,
        driverId,
        proposedPrice: dto.proposedPrice ? parseFloat(dto.proposedPrice.toString()) : null,
        message: dto.message,
        status: 'PENDING',
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleInfo: true,
          },
        },
      },
    });

    return application;
  }

  async getDriverApplications(driverId: string) {
    return this.prisma.shipmentApplication.findMany({
      where: { driverId },
      include: {
        shipment: {
          select: {
            id: true,
            fromCity: true,
            toCity: true,
            weight: true,
            value: true,
            status: true,
            createdBy: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getShipmentApplications(shipmentId: string, shipperId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new BadRequestException('Shipment not found');
    }

    if (shipment.createdById !== shipperId) {
      throw new ForbiddenException(
        'Only shipment creator can view applications',
      );
    }

    return this.prisma.shipmentApplication.findMany({
      where: { shipmentId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            vehicleInfo: {
              select: {
                vehicleType: true,
                licensePlate: true,
                capacity: true,
                verified: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'asc' },
    });
  }

  async acceptApplication(
    shipmentId: string,
    applicationId: string,
    shipperId: string,
  ) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new BadRequestException('Shipment not found');
    }

    if (shipment.createdById !== shipperId) {
      throw new ForbiddenException('Only shipment creator can accept applications');
    }

    const application = await this.prisma.shipmentApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.shipmentId !== shipmentId) {
      throw new BadRequestException('Application not found');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException(`Application is already ${application.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const acceptedApp = await tx.shipmentApplication.update({
        where: { id: applicationId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });

      await tx.shipmentApplication.updateMany({
        where: {
          shipmentId,
          id: { not: applicationId },
        },
        data: {
          status: 'REJECTED',
          respondedAt: new Date(),
        },
      });

      const updatedShipment = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          status: 'ASSIGNED',
          driverId: application.driverId,
        },
        include: {
          driver: { select: { id: true, name: true, phone: true } },
        },
      });

      return { application: acceptedApp, shipment: updatedShipment };
    });
  }

  async rejectApplication(
    shipmentId: string,
    applicationId: string,
    shipperId: string,
  ) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new BadRequestException('Shipment not found');
    }

    if (shipment.createdById !== shipperId) {
      throw new ForbiddenException('Only shipment creator can reject applications');
    }

    const application = await this.prisma.shipmentApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.shipmentId !== shipmentId) {
      throw new BadRequestException('Application not found');
    }

    if (application.status === 'REJECTED') {
      throw new BadRequestException('Application already rejected');
    }

    return this.prisma.shipmentApplication.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
      },
    });
  }

  async withdrawApplication(shipmentId: string, driverId: string) {
    const application = await this.prisma.shipmentApplication.findUnique({
      where: {
        shipmentId_driverId: {
          shipmentId,
          driverId,
        },
      },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot withdraw application with status ${application.status}`,
      );
    }

    await this.prisma.shipmentApplication.delete({
      where: { id: application.id },
    });

    return { message: 'Application withdrawn' };
  }
}