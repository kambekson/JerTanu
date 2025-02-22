import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { ProfileEntity } from "./entities/profile.entity";
import { Repository } from "typeorm";

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(ProfileEntity) private profileRepo: Repository<ProfileEntity>
  ) {}
  create(createProfileDto: CreateProfileDto) {
    const profile = this.profileRepo.create(createProfileDto);
    return this.profileRepo.save(profile);
  }

  findAll() {
    return `This action returns all profiles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
