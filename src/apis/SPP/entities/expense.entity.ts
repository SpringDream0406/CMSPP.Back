import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SppBasicEntity } from './sppBasic.entity';

@Entity()
export class Expense extends SppBasicEntity {
  @PrimaryGeneratedColumn('increment')
  eNumber: number;

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
}
