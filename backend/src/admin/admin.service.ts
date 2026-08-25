import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingDrivers() {
    return this.prisma.user.findMany({
      where: {
        role: 'DRIVER',
        approved: false,
      },
      include: {
        vehicleInfo: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPendingShippers() {
    return this.prisma.user.findMany({
      where: {
        role: 'SHIPPER',
        approved: false,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveDriver(driverId: string) {
    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
    });

    if (!driver || driver.role !== 'DRIVER') {
      throw new BadRequestException('Driver not found');
    }

    return this.prisma.user.update({
      where: { id: driverId },
      data: {
        approved: true,
        approvedAt: new Date(),
        rejectionReason: null,
        rejectedAt: null,
      },
      include: { vehicleInfo: true },
    });
  }

  async rejectDriver(driverId: string, reason: string) {
    const driver = await this.prisma.user.findUnique({
      where: { id: driverId },
    });

    if (!driver || driver.role !== 'DRIVER') {
      throw new BadRequestException('Driver not found');
    }

    return this.prisma.user.update({
      where: { id: driverId },
      data: {
        approved: false,
        rejectedAt: new Date(),
        rejectionReason: reason,
        approvedAt: null,
      },
      include: { vehicleInfo: true },
    });
  }

  async approveShipper(shipperId: string) {
    const shipper = await this.prisma.user.findUnique({
      where: { id: shipperId },
    });

    if (!shipper || shipper.role !== 'SHIPPER') {
      throw new BadRequestException('Shipper not found');
    }

    return this.prisma.user.update({
      where: { id: shipperId },
      data: {
        approved: true,
        approvedAt: new Date(),
        rejectionReason: null,
        rejectedAt: null,
      },
    });
  }

  async rejectShipper(shipperId: string, reason: string) {
    const shipper = await this.prisma.user.findUnique({
      where: { id: shipperId },
    });

    if (!shipper || shipper.role !== 'SHIPPER') {
      throw new BadRequestException('Shipper not found');
    }

    return this.prisma.user.update({
      where: { id: shipperId },
      data: {
        approved: false,
        rejectedAt: new Date(),
        rejectionReason: reason,
        approvedAt: null,
      },
    });
  }

  async getPlatformStats() {
    const totalUsers = await this.prisma.user.count();
    const totalAdmins = await this.prisma.user.count({ where: { role: 'ADMIN' } });
    const totalDrivers = await this.prisma.user.count({ where: { role: 'DRIVER' } });
    const approvedDrivers = await this.prisma.user.count({
      where: { role: 'DRIVER', approved: true },
    });
    const pendingDrivers = await this.prisma.user.count({
      where: { role: 'DRIVER', approved: false },
    });

    const totalShippers = await this.prisma.user.count({ where: { role: 'SHIPPER' } });
    const approvedShippers = await this.prisma.user.count({
      where: { role: 'SHIPPER', approved: true },
    });
    const pendingShippers = await this.prisma.user.count({
      where: { role: 'SHIPPER', approved: false },
    });

    const totalShipments = await this.prisma.shipment.count();
    const availableShipments = await this.prisma.shipment.count({
      where: { status: 'AVAILABLE' },
    });
    const assignedShipments = await this.prisma.shipment.count({
      where: { status: 'ASSIGNED' },
    });
    const inTransitShipments = await this.prisma.shipment.count({
      where: { status: 'IN_TRANSIT' },
    });
    const deliveredShipments = await this.prisma.shipment.count({
      where: { status: 'DELIVERED' },
    });
    const failedShipments = await this.prisma.shipment.count({
      where: { status: 'FAILED' },
    });

    const totalApplications = await this.prisma.shipmentApplication.count();
    const pendingApplications = await this.prisma.shipmentApplication.count({
      where: { status: 'PENDING' },
    });
    const acceptedApplications = await this.prisma.shipmentApplication.count({
      where: { status: 'ACCEPTED' },
    });

    return {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        drivers: {
          total: totalDrivers,
          approved: approvedDrivers,
          pending: pendingDrivers,
        },
        shippers: {
          total: totalShippers,
          approved: approvedShippers,
          pending: pendingShippers,
        },
      },
      shipments: {
        total: totalShipments,
        available: availableShipments,
        assigned: assignedShipments,
        inTransit: inTransitShipments,
        delivered: deliveredShipments,
        failed: failedShipments,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
      },
    };
  }

  async getRecentShipments(limit: number = 10) {
    return this.prisma.shipment.findMany({
      take: limit,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        driver: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}