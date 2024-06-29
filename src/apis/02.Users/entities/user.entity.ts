import { Auth } from 'src/apis/01.Auth/entities/auth.entity';
import { Solar } from 'src/apis/SPP/entities/solar.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
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

  @OneToMany(() => Solar, (solar) => solar.user)
  @JoinColumn({ name: 'authUid', referencedColumnName: 'userUid' })
  solar: Solar;

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
