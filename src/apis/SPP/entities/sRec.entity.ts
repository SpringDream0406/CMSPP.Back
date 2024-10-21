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
export class SRec {
  @PrimaryGeneratedColumn('increment')
  sRecNumber: number;

  @ManyToOne(() => User, (user) => user.sRec)
  user: User;

  @Column({ type: 'varchar', length: 10 })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  sVolume: number;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  sPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
