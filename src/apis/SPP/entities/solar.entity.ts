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
@Unique(['userUid', 'year', 'month'])
export class Solar {
  @PrimaryGeneratedColumn('increment')
  solarNumber: number;

  @Column()
  userUid: string;

  @ManyToOne(() => User, (user) => user.solar)
  @JoinColumn({ name: 'userUid', referencedColumnName: 'authUid' })
  user: User;

  @Column()
  year: number;

  @Column()
  month: number;

  @Column()
  generation: number;

  @Column({ type: 'decimal', scale: 2 })
  smp: number;

  @Column()
  supplyPrice: number;

  @CreateDateColumn()
  createdAt: Date;
}
