import { Controller, Get, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from '@app/dto';
import { CREATE_USER, GET_USER, UserDocument } from '@app/shared';

import { AuthGuard } from '../guards/auth.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  users() {
    return this.userService.findAll();
  }

  @MessagePattern(CREATE_USER)
  createUser(@Payload() data: CreateUserDto) {
    return this.userService.create(data);
  }

  @MessagePattern(GET_USER)
  getUser(@Payload() { email }: Pick<UserDocument, 'email'>) {
    return this.userService.getByEmail(email);
  }
}
