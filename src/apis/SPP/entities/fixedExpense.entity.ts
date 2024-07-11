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
  fixedExpenseNumber: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  fixedExpenseName: string;

  @Column()
  fixedExpensePrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
