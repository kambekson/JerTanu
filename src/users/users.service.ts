import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  create(credentials: CreateUserDto): Promise<UserEntity> {
    const user = this.userRepo.create({
      ...credentials,
      isVerified: false
    });
    return this.userRepo.save(user);
  }

  findAll(): Promise<UserEntity[]> {
    return this.userRepo.find();
  }

  findById(id: number) {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  findOneByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async update(id: number, credentials: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User with ID = ${id} not found`);

    if (credentials.password) {
      const salt = randomBytes(8).toString('hex');
      const hash = (await scrypt(credentials.password, salt, 32)) as Buffer;
      credentials.password = `${salt}.${hash.toString('hex')}`;
    }

    Object.assign(user, credentials);
    return this.userRepo.save(user);
  }

  async remove(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User with ID = ${id} not found`);
    return this.userRepo.remove(user);
  }
}
