import { Module } from '@nestjs/common';
import { ShipmentApplicationService } from './shipment-application.service';
import { ShipmentApplicationController } from './shipment-application.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ShipmentApplicationService],
  controllers: [ShipmentApplicationController],
  exports: [ShipmentApplicationService],
})
export class ShipmentApplicationModule {}