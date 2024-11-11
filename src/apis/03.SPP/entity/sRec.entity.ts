import { IsDateString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { User } from 'src/apis/02.User/entity/user.entity';
import { BaseTable } from 'src/common/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class SRec extends BaseTable {
  @ManyToOne(() => User, (user) => user.sRec, { onDelete: 'CASCADE' })
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
}
