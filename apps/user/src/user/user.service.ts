import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '@app/dto';
import { User, UserDocument } from '@app/shared';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  create(dto: CreateUserDto): Promise<UserDocument> {
    return this.userModel.create(dto);
  }

  getByEmail(email: string): Promise<UserDocument> {
    return this.userModel
      .findOne({
        email,
      })
      .exec();
  }
}
