import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { User } from 'src/apis/02.User/entity/user.entity';
import { BaseTable } from 'src/common/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class FixedExpense extends BaseTable {
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
}
