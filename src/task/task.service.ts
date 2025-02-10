import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/udate-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity) private taskRepo: Repository<TaskEntity>,
  ) {}

  findAll() {
    return this.taskRepo.find();
  }

  findById(id: number): Promise<TaskEntity> {
    return this.taskRepo.findOne({
      where: { id },
    });
  }

  create(credentials: CreateTaskDto) {
    const task = this.taskRepo.create(credentials);
    return this.taskRepo.save(task);
  }

  async remove(id: number) {
    const task = await this.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.taskRepo.remove(task);
  }

  async update(id: number, credentials: UpdateTaskDto) {
    const task = await this.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    Object.assign(task, credentials);

    return this.taskRepo.save(task);
  }
}
