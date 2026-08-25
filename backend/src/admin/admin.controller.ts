import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard, Roles } from '../auth/role.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

export class ApprovalDto {
  @ApiProperty({ example: 'Invalid driver license' })
  reason?: string;
}

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(['ADMIN'])
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('drivers/pending')
  async getPendingDrivers() {
    return this.adminService.getPendingDrivers();
  }

  @Get('shippers/pending')
  async getPendingShippers() {
    return this.adminService.getPendingShippers();
  }

  @Patch('drivers/:id/approve')
  async approveDriver(@Param('id') driverId: string) {
    return this.adminService.approveDriver(driverId);
  }

  @Patch('drivers/:id/reject')
  async rejectDriver(@Param('id') driverId: string, @Body() dto: ApprovalDto) {
    return this.adminService.rejectDriver(
      driverId,
      dto.reason || 'No reason provided',
    );
  }

  @Patch('shippers/:id/approve')
  async approveShipper(@Param('id') shipperId: string) {
    return this.adminService.approveShipper(shipperId);
  }

  @Patch('shippers/:id/reject')
  async rejectShipper(@Param('id') shipperId: string, @Body() dto: ApprovalDto) {
    return this.adminService.rejectShipper(
      shipperId,
      dto.reason || 'No reason provided',
    );
  }

  @Get('stats')
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('shipments/recent')
  async getRecentShipments() {
    return this.adminService.getRecentShipments(10);
  }
}