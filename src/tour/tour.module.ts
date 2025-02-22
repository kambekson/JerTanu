import { Module } from '@nestjs/common';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { TourEntity } from "./tour.entity";

@Module({
  controllers: [TourController],
  providers: [TourService],
  imports: [
    TypeOrmModule.forFeature([TourEntity])
  ]
})
export class TourModule {}
