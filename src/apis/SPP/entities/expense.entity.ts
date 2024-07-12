import { User } from 'src/apis/02.Users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('increment')
  eNumber: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column()
  day: number;

  @Column()
  eName: string;

  @Column()
  ePrice: string;

  @CreateDateColumn()
  createdAt: Date;
}
