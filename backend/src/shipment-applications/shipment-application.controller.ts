import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShipmentApplicationService } from './shipment-application.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/role.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateApplicationDto } from './dto/create-application.dto';

@ApiTags('ShipmentApplications')
@Controller('api/applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShipmentApplicationController {
  constructor(private applicationService: ShipmentApplicationService) {}

  @Get('available')
  @UseGuards(RoleGuard)
  @Roles(['DRIVER'])
  async getAvailableShipments(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('fromCity') fromCity?: string,
    @Query('toCity') toCity?: string,
  ) {
    const pageNumber = Number.parseInt(page, 10) || 1;
    const limitNumber = Number.parseInt(limit, 10) || 10;
    const filters: any = {};
    if (fromCity) filters.fromCity = fromCity;
    if (toCity) filters.toCity = toCity;

    return this.applicationService.getAvailableShipments(
      pageNumber,
      limitNumber,
      filters,
    );
  }

  @Post('shipments/:shipmentId/apply')
  @UseGuards(RoleGuard)
  @Roles(['DRIVER'])
  async applyForShipment(
    @Param('shipmentId') shipmentId: string,
    @Body() dto: CreateApplicationDto,
    @Request() req,
  ) {
    return this.applicationService.applyForShipment(
      shipmentId,
      req.user.id,
      dto,
    );
  }

  @Get('my-applications')
  @UseGuards(RoleGuard)
  @Roles(['DRIVER'])
  async getMyApplications(@Request() req) {
    return this.applicationService.getDriverApplications(req.user.id);
  }

  @Get('shipments/:shipmentId/applications')
  async getShipmentApplications(
    @Param('shipmentId') shipmentId: string,
    @Request() req,
  ) {
    return this.applicationService.getShipmentApplications(shipmentId, req.user.id);
  }

  @Patch('shipments/:shipmentId/applications/:applicationId/accept')
  async acceptApplication(
    @Param('shipmentId') shipmentId: string,
    @Param('applicationId') applicationId: string,
    @Request() req,
  ) {
    return this.applicationService.acceptApplication(
      shipmentId,
      applicationId,
      req.user.id,
    );
  }

  @Patch('shipments/:shipmentId/applications/:applicationId/reject')
  async rejectApplication(
    @Param('shipmentId') shipmentId: string,
    @Param('applicationId') applicationId: string,
    @Request() req,
  ) {
    return this.applicationService.rejectApplication(
      shipmentId,
      applicationId,
      req.user.id,
    );
  }

  @Delete('shipments/:shipmentId/apply')
  @UseGuards(RoleGuard)
  @Roles(['DRIVER'])
  async withdrawApplication(
    @Param('shipmentId') shipmentId: string,
    @Request() req,
  ) {
    return this.applicationService.withdrawApplication(
      shipmentId,
      req.user.id,
    );
  }
}