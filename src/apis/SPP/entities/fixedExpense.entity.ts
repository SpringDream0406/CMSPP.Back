import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
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

  @ManyToOne(() => User, (user) => user.fixedExpense)
  user: User;

  @Column({ type: 'varchar', length: 7 })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @Column({ type: 'varchar', length: 7 })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  feName: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  fePrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
