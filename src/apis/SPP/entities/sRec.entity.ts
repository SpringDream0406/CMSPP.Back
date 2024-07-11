import { User } from 'src/apis/02.Users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class SRec {
  @PrimaryGeneratedColumn('increment')
  sRecNumber: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column()
  day: number;

  @Column()
  sVolume: number;

  @Column()
  sPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
