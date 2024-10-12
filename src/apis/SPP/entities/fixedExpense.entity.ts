import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SppBasicEntity } from './sppBasic.entity';

@Entity()
export class FixedExpense extends SppBasicEntity {
  @PrimaryGeneratedColumn('increment')
  feNumber: number;

  // @ManyToOne(() => User)
  // user: User;

  @Column({ type: 'varchar', length: 7 })
  @IsNotEmpty()
  @IsString()
  startDate: string;

  @Column({ type: 'varchar', length: 7 })
  @IsNotEmpty()
  @IsString()
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

  // @CreateDateColumn()
  // createdAt: Date;
}
