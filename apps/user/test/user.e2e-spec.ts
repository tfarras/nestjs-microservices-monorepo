import { INestApplication } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { CREATE_USER, GET_USER, NatsClientService } from '@app/shared';
import { firstValueFrom } from 'rxjs';
import * as request from 'supertest';

import { AuthModule } from '../../auth/src/auth.module';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let client: NatsClientService;
  let authServer;
  let userServer;
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

    await authService.startAllMicroservices();
    await authService.init();

    authServer = authService.getHttpAdapter().getInstance();
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

    client = app.get(NatsClientService);
    await client.nats.connect();

    userServer = app.getHttpAdapter().getInstance();
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

  describe('Message: CREATE_USER ', () => {
    it(`successfully`, async () => {
      const data = await firstValueFrom(
        client.nats.send(CREATE_USER, {
          username,
          email: `${username}@test.com`,
          password: 'somePass',
        }),
      );

      expect(data.username).toEqual(username);
      expect(data.email).toEqual(`${username}@test.com`);
    });

    it(`error`, async () => {
      expect(
        firstValueFrom(
          client.nats.send(CREATE_USER, {
            username,
            email: `${username}@test.com`,
            password: 'somePass',
          }),
        ),
      ).rejects.toBeInstanceOf(Object);
    });
  });

  describe('Message: GET_USER', () => {
    it('successfully', async () => {
      const data = await firstValueFrom(
        client.nats.send(GET_USER, {
          email: `${username}@test.com`,
        }),
      );

      expect(data.email).toEqual(`${username}@test.com`);
    });

    it('not found', async () => {
      const data = await firstValueFrom(
        client.nats.send(GET_USER, {
          email: `${username}@${username}.com`,
        }),
      );
      expect(data).toBeFalsy();
    });
  });

  describe('/GET users', () => {
    it('return list of users, with created one', async () => {
      generateUsername();

      await request(authServer)
        .post('/register')
        .send({
          username,
          email: `${username}@test.com`,
          password: 'somePass',
        });

      const { body } = await request(authServer)
        .post('/login')
        .send({
          email: `${username}@test.com`,
          password: 'somePass',
        });

      const { body: list } = await request(userServer)
        .get('/users')
        .set('Authorization', `Bearer ${body.accessToken}`)
        .expect(200);

      const user = list.find(({ email }) => email === `${username}@test.com`);

      expect(user).toBeTruthy();
    });
  });
});
