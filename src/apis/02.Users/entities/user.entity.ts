import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Auth } from 'src/apis/01.Auth/entities/auth.entity';
import { Expense } from 'src/apis/SPP/entities/expense.entity';
import { FixedExpense } from 'src/apis/SPP/entities/fixedExpense.entity';
import { SRec } from 'src/apis/SPP/entities/sRec.entity';
import { Solar } from 'src/apis/SPP/entities/solar.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  userNumber: number;

  @OneToOne(() => Auth)
  @JoinColumn()
  auth: Auth;

  @OneToMany(() => Solar, (solar) => solar.user)
  solar: Solar;

  @OneToMany(() => SRec, (rec) => rec.user)
  sRec: SRec;

  @OneToMany(() => FixedExpense, (fixedExpense) => fixedExpense.user)
  fixedExpense: FixedExpense;

  @OneToMany(() => Expense, (expense) => expense.user)
  expense: Expense;

  @Column({ nullable: true, unique: true })
  @IsNotEmpty()
  @IsString()
  businessNumber: string;

  @Column({ nullable: true })
  @IsNotEmpty()
  @IsString()
  address: string;

  @Column({ nullable: true })
  @IsNotEmpty()
  @IsNumber()
  kWh: number;

  @Column({ nullable: true, type: 'decimal', precision: 3, scale: 1 })
  @IsNotEmpty()
  @IsNumber()
  recWeight: number;

  @CreateDateColumn()
  createdAt: Date;
}
