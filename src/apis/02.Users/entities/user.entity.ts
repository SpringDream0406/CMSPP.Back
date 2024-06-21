import { Auth } from 'src/apis/01.Auth/entities/auth.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
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

  @Column({ nullable: true })
  businessNum: string;

  @Column({ nullable: true })
  address1: string;

  @Column({ nullable: true })
  address2: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
