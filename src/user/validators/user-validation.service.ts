/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from '../entity/user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserValidationService {
  constructor(
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
  ) {}

  async validateUserExists(id: string): Promise<User> {
    if (!id || !ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid or missing userId format');
    }
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async validateOwner(id: string, requesterId: string): Promise<void> {
    if (id !== requesterId) {
      throw new UnauthorizedException('You can only update your own profile');
    }
  }

  async validateAdmin(requesterRole: string): Promise<void> {
    if (requesterRole !== 'admin') {
      throw new ForbiddenException('Only admins can perform this action');
    }
  }

  async validateActive(user: User): Promise<void> {
    if (user.status !== 'active') {
      throw new UnauthorizedException('User is banned or inactive');
    }
  }
}
