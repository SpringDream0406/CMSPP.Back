import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { User } from 'src/apis/02.Users/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FixedExpense extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

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
