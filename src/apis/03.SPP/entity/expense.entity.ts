import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { User } from 'src/apis/02.User/entity/user.entity';
import { BaseTable } from 'src/common/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Expense extends BaseTable {
  @ManyToOne(() => User, (user) => user.expense, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 10 })
  @IsNotEmpty()
  @IsDateString()
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
}
