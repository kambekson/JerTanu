import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TourEntity } from "./tour.entity";
import { Repository } from "typeorm";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/udate-task.dto";
import { UserEntity } from "../users/user.entity";

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(TourEntity) private tourRepo: Repository<TourEntity>
  ) {}

  findAll() {
    return this.tourRepo.find();
  }

  findById(id: number): Promise<TourEntity> {
    return this.tourRepo.findOne({
      where: { id }
    })
  }

  create(credentials: CreateTaskDto, user: UserEntity) {
    const tour = this.tourRepo.create(credentials);
    tour.user = user;
    return this.tourRepo.save(tour);
  }

  async remove(id: number) {
    const tour = await this.findById(id);
    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }
    return this.tourRepo.remove(tour);
  }


  async update(id: number, credentials: UpdateTaskDto) {
    const tour = await this.findById(id);
    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }
    Object.assign(tour, credentials);

    return this.tourRepo.save(tour);
  }
}
