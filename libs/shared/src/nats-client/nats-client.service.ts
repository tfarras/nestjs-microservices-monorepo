import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NatsClientService implements OnApplicationBootstrap {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly client: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  get nats() {
    return this.client;
  }
}
