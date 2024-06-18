import { Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GqlAuthGuard } from './guards/gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => String)
  fetchData(
    @Context() context: IContext, //
  ): string {
    console.log(context.req.user);
    return 'test';
  }

  @UseGuards(AuthGuard('restore'))
  @Mutation(() => String)
  restoreAccessToken() {}
}

interface IAuthUser {
  user?: {
    uid: string;
  };
}

interface IContext {
  req: Request & IAuthUser;
  res: Response;
}
