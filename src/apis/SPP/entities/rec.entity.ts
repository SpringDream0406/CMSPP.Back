import { User } from 'src/apis/02.Users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Rec {
  @PrimaryGeneratedColumn('increment')
  recNumber: number;

  @Column()
  userUid: string;

  @ManyToOne(() => User, (user) => user.rec)
  @JoinColumn({ name: 'userUid', referencedColumnName: 'authUid' })
  user: User;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column()
  fee: number;

  @Column()
  issusRec: number;

  @Column()
  salsesVolume: number;

  @Column()
  salsesPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
