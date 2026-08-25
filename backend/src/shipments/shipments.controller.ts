import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/role.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateShipmentDto, UpdateShipmentStatusDto } from './dto/create-shipment.dto';

@ApiTags('Shipments')
@Controller('api/shipments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShipmentsController {
  constructor(private shipmentsService: ShipmentsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(['SHIPPER'])
  async createShipment(@Body() dto: CreateShipmentDto, @Request() req) {
    return this.shipmentsService.createShipment(dto, req.user.id);
  }

  @Get('my-shipments')
  @UseGuards(RoleGuard)
  @Roles(['SHIPPER'])
  async getMyShipments(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNumber = Number.parseInt(page, 10) || 1;
    const limitNumber = Number.parseInt(limit, 10) || 10;
    return this.shipmentsService.getShipperShipments(req.user.id, pageNumber, limitNumber);
  }

  @Get('driver/my-shipments')
  @UseGuards(RoleGuard)
  @Roles(['DRIVER'])
  async getMyAssignedShipments(@Request() req) {
    return this.shipmentsService.getDriverShipments(req.user.id);
  }

  @Get(':id')
  async getShipmentById(@Param('id') id: string) {
    return this.shipmentsService.getShipmentById(id);
  }

  @Patch(':id/status')
  async updateShipmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
    @Request() req,
  ) {
    return this.shipmentsService.updateShipmentStatus(id, dto, req.user.id);
  }

  @Delete(':id')
  async deleteShipment(@Param('id') id: string, @Request() req) {
    return this.shipmentsService.deleteShipment(id, req.user.id);
  }
}