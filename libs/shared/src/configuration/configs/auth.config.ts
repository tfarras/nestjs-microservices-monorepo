import { registerAs } from '@nestjs/config';

export const AUTH_CONFIG = 'auth';

export interface IAuthConfig {
  saltRound: number;
  jwtSecret: string;
}

export const authConfig = registerAs<IAuthConfig>(
  AUTH_CONFIG,
  (): IAuthConfig => ({
    saltRound: parseInt(process.env.SALT_ROUND, 10),
    jwtSecret: process.env.JWT_SECRET,
  }),
);
