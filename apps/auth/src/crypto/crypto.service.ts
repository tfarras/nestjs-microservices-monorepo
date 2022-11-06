import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_CONFIG } from '@app/shared';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class CryptoService {
  constructor(private readonly configService: ConfigService) {}

  public async generateHash(str: string) {
    const salt = await this.generateSalt();

    return hash(str, salt);
  }

  public compareHash(str: string, hashString: string) {
    return compare(str, hashString);
  }

  private generateSalt() {
    return genSalt(this.configService.get(`${AUTH_CONFIG}.saltRound`));
  }
}
