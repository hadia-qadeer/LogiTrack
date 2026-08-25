import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { VehicleService, CreateVehicleDto } from './vehicle.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/drivers/vehicle')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(['DRIVER'])
  async createVehicle(@Body() dto: CreateVehicleDto, @Request() req) {
    return this.vehicleService.createOrUpdateVehicle(req.user.id, dto);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles(['DRIVER'])
  async getVehicle(@Request() req) {
    return this.vehicleService.getVehicleInfo(req.user.id);
  }

  @Patch()
  @UseGuards(RoleGuard)
  @Roles(['DRIVER'])
  async updateVehicle(@Body() dto: CreateVehicleDto, @Request() req) {
    return this.vehicleService.createOrUpdateVehicle(req.user.id, dto);
  }
}