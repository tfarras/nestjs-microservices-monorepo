import { INestApplication } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { LOG_LOGGER } from '@app/shared';

import { LoggerModule } from '../src/logger.module';
import { LoggerService } from '../src/logger.service';

const delay = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

describe('LoggerController (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;
  let loggerService: LoggerService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ClientsModule.register([
          {
            name: 'NATS_CLIENT',
            transport: Transport.NATS,
            options: {
              servers: ['nats://localhost:4222'],
            },
          },
        ]),
      ],
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

    client = app.get('NATS_CLIENT');
    await client.connect();

    loggerService = app.get(LoggerService);
  });

  afterAll(async () => {
    await app.close();

    client.close();
  });

  it(`Event: ${LOG_LOGGER}`, async () => {
    const spyOnWriteLog = jest.spyOn(loggerService, 'writeLog');
    const data = {
      context: { args: [LOG_LOGGER] },
      response: true,
      incomingData: 'some data',
    };

    await client.emit(LOG_LOGGER, data);
    await delay(1000);

    expect(spyOnWriteLog).toBeCalled();
    expect(spyOnWriteLog).toBeCalledWith(data);
  });
});
