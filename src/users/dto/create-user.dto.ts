import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { CreateProfileDto } from "../../profiles/dto/create-profile.dto";

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  // @Matches('')
  password: string;

  @IsOptional()
  profile: CreateProfileDto | null;
}
