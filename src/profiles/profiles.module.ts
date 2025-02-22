import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfileEntity } from "./entities/profile.entity";

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
  imports: [
    TypeOrmModule.forFeature([ProfileEntity])
  ],
  exports: [ProfilesService]
})
export class ProfilesModule {}
