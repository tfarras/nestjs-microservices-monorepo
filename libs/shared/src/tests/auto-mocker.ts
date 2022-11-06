import { InjectionToken } from '@nestjs/common';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

type ToBeMockedAs = [InjectionToken, Record<string, any>];

export const autoMocker = (values: ToBeMockedAs[]) => {
  return (token) => {
    const foundToken = values.find(
      ([toBeMockedToken]) => toBeMockedToken === token,
    );
    if (foundToken) {
      return foundToken[1];
    }

    if (typeof token === 'function') {
      const mockMetadata = moduleMocker.getMetadata(
        token,
      ) as MockFunctionMetadata<any, any>;
      const Mock = moduleMocker.generateFromMetadata(mockMetadata);
      return new Mock();
    }
  };
};
