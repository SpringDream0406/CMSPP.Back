import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Expense } from 'src/apis/SPP/entities/expense.entity';
import { FixedExpense } from 'src/apis/SPP/entities/fixedExpense.entity';
import { SRec } from 'src/apis/SPP/entities/sRec.entity';
import { Solar } from 'src/apis/SPP/entities/solar.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  userNumber: number;

  @OneToMany(() => Solar, (solar) => solar.user)
  solar: Solar[];

  @OneToMany(() => SRec, (rec) => rec.user)
  sRec: SRec[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expense: Expense[];

  @OneToMany(() => FixedExpense, (fixedExpense) => fixedExpense.user)
  fixedExpense: FixedExpense[];

  @Column({ nullable: true, unique: true })
  @IsNotEmpty()
  @IsNumber() // front에서 number로 보냄
  businessNumber: string; // 숫자로 저장하기에는 큰값이라 string 처리

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
