import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SppBasicEntity } from './sppBasic.entity';

@Entity()
export class SRec extends SppBasicEntity {
  @PrimaryGeneratedColumn('increment')
  sRecNumber: number;

  @Column({ type: 'varchar', length: 10 })
  @IsNotEmpty()
  @IsString()
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
