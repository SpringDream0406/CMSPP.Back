import { Exclude } from 'class-transformer';
import { User } from 'src/apis/02.User/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Exclude()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  id: string;

  @Column()
  provider: string;

  @OneToOne(() => User, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
