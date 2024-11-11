import { IsDateString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { User } from 'src/apis/02.User/entity/user.entity';
import { BaseTable } from 'src/common/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Solar extends BaseTable {
  @ManyToOne(() => User, (user) => user.solar, { onDelete: 'CASCADE' })
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
}
