import {
  Body,
  Controller,
  Delete,
  Get, NotFoundException,
  Param,
  Patch,
  Post
} from "@nestjs/common";
import { TourService } from "./tour.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/udate-task.dto";
import { Public } from "../interceptors/public.interceptor";
import { GetUser } from "../auth/get-user.decorator";
import { UserEntity } from "../users/user.entity";


@Controller('tours')
export class TourController {

  constructor(
    private tourService: TourService
  ) {}

  @Get()
  findAll() {
    return this.tourService.findAll();
  }


  @Get(':id')
  async findById(@Param('id') id: string) {
    const tour = await this.tourService.findById(+id);
    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }
    return tour;
  }

  @Post()
  create(@Body() body: CreateTaskDto, @GetUser() user: UserEntity) {
    return this.tourService.create(body, user)
  }

  @Patch(':id')
  update(@Body() body: UpdateTaskDto, @Param('id') id: string) {
    return this.tourService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tourService.remove(+id);
  }
}
