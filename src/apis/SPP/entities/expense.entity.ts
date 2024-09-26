import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
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

  @Column({ type: 'varchar', length: 10 })
  @IsNotEmpty()
  @IsString()
  date: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  eName: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  ePrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
