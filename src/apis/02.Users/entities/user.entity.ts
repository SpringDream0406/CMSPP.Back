import { Auth } from 'src/apis/01.Auth/entities/auth.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  userNumber: number;

  @Column()
  authUid: string;

  @OneToOne(() => Auth)
  @JoinColumn({ name: 'authUid', referencedColumnName: 'uid' })
  auth: Auth;
}
