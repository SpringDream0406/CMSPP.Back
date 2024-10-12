import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { SppBasicEntity } from './sppBasic.entity';

@Entity()
@Unique(['date'])
export class Solar extends SppBasicEntity {
  @PrimaryGeneratedColumn('increment')
  solarNumber: number;

  @Column({ type: 'varchar', length: 7 })
  @IsNotEmpty()
  @IsString()
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
