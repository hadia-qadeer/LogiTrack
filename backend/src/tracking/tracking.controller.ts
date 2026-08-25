import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Tracking')
@Controller('api/tracking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Get(':shipmentId/history')
  async getTrackingHistory(@Param('shipmentId') shipmentId: string) {
    return this.trackingService.getTrackingHistory(shipmentId);
  }

  @Get(':shipmentId/latest')
  async getLatestTracking(@Param('shipmentId') shipmentId: string) {
    return this.trackingService.getLatestTracking(shipmentId);
  }
}