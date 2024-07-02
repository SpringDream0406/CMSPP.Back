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
export class FixedExpense {
  @PrimaryGeneratedColumn('increment')
  fixedExpenseNumber: number;

  @Column()
  userUid: string;

  @ManyToOne(() => User, (user) => user.fixedExpense)
  @JoinColumn({ name: 'userUid', referencedColumnName: 'authUid' })
  user: User;

  @Column()
  fixedExpenseName: string;

  @Column()
  fixedExpensePrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
