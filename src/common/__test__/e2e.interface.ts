import { User } from 'src/apis/02.User/entities/user.entity';

interface E2eBase {
  statusCode: number;
}

export interface E2eError extends E2eBase {
  body: { message: string };
}

export interface E2eUpdate extends E2eBase {
  body: { affected: number };
}

export interface E2eUser extends E2eBase {
  body: User;
}
