import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Auth {
  @PrimaryColumn()
  id: string;

  @Column()
  provider: string;

  @Generated('uuid')
  @Column({ unique: true })
  uid: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
