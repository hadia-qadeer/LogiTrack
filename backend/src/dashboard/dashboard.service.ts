import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(user?: { id: string; role: string }) {
    const where = user?.role === 'DRIVER' ? { driverId: user.id } : undefined;
    const shipments = await this.prisma.shipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    const byStatus: Record<string, number> = {};
    const byCity: Record<string, number> = {};

    for (const shipment of shipments) {
      byStatus[shipment.status] = (byStatus[shipment.status] || 0) + 1;
      byCity[shipment.toCity] = (byCity[shipment.toCity] || 0) + 1;
    }

    const delivered = shipments.filter(
      (shipment) => shipment.status === 'DELIVERED' && shipment.deliveredAt,
    );
    const failed = shipments.filter((shipment) => shipment.status === 'FAILED');
    const deliveryDays = delivered.map(
      (shipment) =>
        (shipment.deliveredAt!.getTime() - shipment.createdAt.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const onTimeDeliveries = delivered.filter(
      (shipment) =>
        shipment.expectedDelivery !== null &&
        shipment.deliveredAt! <= shipment.expectedDelivery,
    ).length;
    const completedShipments = delivered.length + failed.length;

    return {
      totalShipments: shipments.length,
      statistics: {
        pending: byStatus.PENDING || 0,
        inTransit: byStatus.IN_TRANSIT || 0,
        delivered: byStatus.DELIVERED || 0,
        failed: byStatus.FAILED || 0,
        cancelled: byStatus.CANCELLED || 0,
      },
      metrics: {
        averageDeliveryDays: deliveryDays.length
          ? deliveryDays.reduce((total, days) => total + days, 0) /
            deliveryDays.length
          : 0,
        onTimeDelivery: delivered.length
          ? (onTimeDeliveries / delivered.length) * 100
          : 0,
        deliverySuccess: completedShipments
          ? (delivered.length / completedShipments) * 100
          : 0,
      },
      chartData: {
        byStatus,
        byCity,
      },
      recent: shipments.slice(0, 5),
    };
  }
}
