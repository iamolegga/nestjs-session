import { Type } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Adapter = Type<AbstractHttpAdapter<any, any, any>>;

export const platforms: Adapter[] = [ExpressAdapter];
