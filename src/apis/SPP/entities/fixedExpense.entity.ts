import { User } from 'src/apis/02.Users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FixedExpense {
  @PrimaryGeneratedColumn('increment')
  feNumber: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  feName: string;

  @Column()
  fePrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
