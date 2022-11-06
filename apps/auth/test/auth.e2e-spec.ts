import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { CHECK_AUTH, NatsClientService } from '@app/shared';
import { firstValueFrom } from 'rxjs';
import * as request from 'supertest';

import { AppModule } from '../../user/src/app.module';
import { AuthModule } from '../src/auth.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let client: NatsClientService;
  let authServer;
  let authService: INestApplication;
  let username: string;

  const createAuthApp = async () => {
    const authModule: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    authService = authModule.createNestApplication();

    authService.connectMicroservice({
      transport: Transport.NATS,
      options: {
        servers: ['nats://localhost:4222'],
      },
    });
    await authService.useGlobalPipes(new ValidationPipe());
    await authService.startAllMicroservices();
    await authService.init();

    authServer = authService.getHttpAdapter().getInstance();

    client = app.get(NatsClientService);
    await client.nats.connect();
  };

  const createUserApp = async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.connectMicroservice({
      transport: Transport.NATS,
      options: {
        servers: ['nats://localhost:4222'],
      },
    });

    await app.startAllMicroservices();
    await app.init();
  };

  const generateUsername = () => {
    username = (Math.random() + 1).toString(36).substring(2);
  };

  beforeAll(async () => {
    await createUserApp();
    await createAuthApp();

    generateUsername();
  });

  afterAll(async () => {
    await app.close();
    await authService.close();

    client.nats.close();
  });

  describe('/POST register', () => {
    it('should register an user', async () => {
      const { body } = await request(authServer)
        .post('/register')
        .send({
          username,
          email: `${username}@test.com`,
          password: 'somePass',
        })
        .expect(201);

      expect(body).toHaveProperty('email', `${username}@test.com`);
      expect(body).toHaveProperty('username', username);
    });

    it('should fail', async () => {
      const res = await request(authServer)
        .post('/register')
        .send({
          username,
          email: `${username}@test.com`,
          password: 'somePass',
        });

      expect(res.statusCode).not.toEqual(201);
    });

    it('should fail validation', async () => {
      const res = await request(authServer).post('/register').send({
        email: 'tfarras123@test.com',
        username: '123',
        password: '1593578624',
      });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('/POST login', () => {
    it('should return unauthorized', async () => {
      const res = await request(authServer).post('/login').send({
        email: 'wrongEmail@test.com',
        password: 'wrongPass',
      });

      expect(res.statusCode).toEqual(401);
    });

    it('should return accessToken', async () => {
      const res = await request(authServer)
        .post('/login')
        .send({
          email: `${username}@test.com`,
          password: 'somePass',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.accessToken).toBeTruthy();
    });
  });

  describe('Message CHECK_AUTH', () => {
    it('should return false', async () => {
      const data = await firstValueFrom(
        client.nats.send(CHECK_AUTH, {
          jwt: 'wrongJwt',
        }),
      );

      expect(data).toEqual(false);
    });

    it('should return jwtPayload', async () => {
      const { body } = await request(authServer)
        .post('/login')
        .send({
          email: `${username}@test.com`,
          password: 'somePass',
        });

      const data = await firstValueFrom(
        client.nats.send(CHECK_AUTH, {
          jwt: body.accessToken,
        }),
      );

      const properties = ['exp', 'iat', 'user'];

      for (const property of properties) {
        expect(data).toHaveProperty(property);
      }
    });
  });
});
