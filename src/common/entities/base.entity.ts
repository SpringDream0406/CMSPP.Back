import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseTable {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  createdAt: Date;
}
