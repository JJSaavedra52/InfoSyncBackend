/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user (sign up)',
    description: 'Anyone can create a user. No authentication required.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Requires Authorization header: Bearer your_jwt_token.',
  })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID',
    description: 'Requires Authorization header: Bearer your_jwt_token.',
  })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update your own user profile',
    description:
      'Requires Authorization header: Bearer your_jwt_token. Only the owner can update their profile.',
  })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    return this.userService.update(id, updateUserDto, req.user.userId);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update user status (ban/unban)',
    description:
      'Requires Authorization header: Bearer your_jwt_token. Only admins can update user status.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'banned'],
          example: 'banned',
        },
      },
      required: ['status'],
    },
  })
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'banned',
    @Req() req,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can update user status');
    }
    return this.userService.updateStatus(id, status, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Requires Authorization header: Bearer your_jwt_token. Only admins can delete users.',
  })
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.userService.remove(id, req.user.role);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Anyone can login. No authentication required.',
  })
  async login(@Body() body: { userEmail: string; password: string }) {
    return this.userService.login(body.userEmail, body.password);
  }
}
