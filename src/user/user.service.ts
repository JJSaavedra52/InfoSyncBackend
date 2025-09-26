/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserValidationService } from './validators/user-validation.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    private jwtService: JwtService,
    private userValidationService: UserValidationService, // Inject validation service
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check for duplicate email or username
    const existingUser = await this.userRepository.findOne({
      where: {
        $or: [
          { userEmail: createUserDto.userEmail },
          { userName: createUserDto.userName },
        ],
      },
    });
    if (existingUser) {
      throw new BadRequestException('Email or username already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      passwordHash,
      status: 'active',
      postsCount: 0,
      commentsCount: 0,
      likesCount: 0,
      reportsCount: 0,
      savedPosts: [],
      createdAt: new Date(),
    });
    return await this.userRepository.save(newUser);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, requesterId: string) {
    await this.userValidationService.validateOwner(id, requesterId);
    if (updateUserDto.password) {
      updateUserDto.passwordHash = await bcrypt.hash(
        updateUserDto.password,
        10,
      );
      delete updateUserDto.password;
    }
    await this.userRepository.update(
      { _id: new ObjectId(id) } as any,
      updateUserDto,
    );
    return await this.findOne(id);
  }

  async updateStatus(
    id: string,
    status: 'active' | 'banned',
    requesterRole: string, // This one is used below, so keep as is
  ) {
    await this.userValidationService.validateAdmin(requesterRole);
    await this.userRepository.update({ _id: new ObjectId(id) } as any, {
      status,
    });
    return await this.findOne(id);
  }

  async remove(id: string, requesterRole: string) {
    await this.userValidationService.validateAdmin(requesterRole);
    await this.userRepository.delete({ _id: new ObjectId(id) } as any);
    return { message: `User ${id} deleted` };
  }

  async login(userEmail: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { userEmail },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    await this.userValidationService.validateActive(user);
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user._id.toString(), role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        userEmail: user.userEmail,
        userName: user.userName,
        role: user.role,
        status: user.status,
      },
    };
  }
}
