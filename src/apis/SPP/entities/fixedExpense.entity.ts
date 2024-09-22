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

  @Column({ type: 'varchar', length: 7 })
  startDate: Date;

  @Column({ type: 'varchar', length: 7 })
  endDate: Date;

  @Column()
  feName: string;

  @Column()
  fePrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
