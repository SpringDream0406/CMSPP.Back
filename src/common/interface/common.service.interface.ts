import { ExecutionContext } from '@nestjs/common';
import { ReflectableDecorator } from '@nestjs/core';
import { Request } from 'express';

export interface IGetMetaData {
  decorator: ReflectableDecorator<any, any>;
  context: ExecutionContext;
}

export interface IGetToken {
  isRefresh: boolean;
  req: Request;
}

export interface IValidateToken {
  isRefresh: boolean;
  token: string;
  req: Request;
}
