import { IsDateString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { User } from 'src/apis/02.Users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Solar {
  @PrimaryGeneratedColumn('increment')
  solarNumber: number;

  @ManyToOne(() => User, (user) => user.solar)
  user: User;

  @Column({ type: 'varchar', length: 7, unique: true })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  generation: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  smp: number;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  supplyPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
