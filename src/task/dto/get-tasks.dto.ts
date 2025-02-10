import { IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTasksDto {
  @IsString()
  search: string;

  @IsString()
  genre: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  year: number;
}
