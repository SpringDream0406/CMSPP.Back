import { User } from 'src/apis/02.Users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['date'])
export class Solar {
  @PrimaryGeneratedColumn('increment')
  solarNumber: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ type: 'varchar', length: 7 })
  date: string;

  @Column()
  generation: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  smp: number;

  @Column()
  supplyPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
