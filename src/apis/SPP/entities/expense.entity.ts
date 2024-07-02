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
export class Expense {
  @PrimaryGeneratedColumn('increment')
  expenseNumber: number;

  @Column()
  userUid: string;

  @ManyToOne(() => User, (user) => user.expense)
  @JoinColumn({ name: 'userUid', referencedColumnName: 'authUid' })
  user: User;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column()
  expenseName: string;

  @Column()
  expensePrice: string;

  @CreateDateColumn()
  createdAt: Date;
}
