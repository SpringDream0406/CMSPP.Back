import { User } from 'src/apis/02.Users/entities/user.entity';
import { CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';

export class SppBasicEntity {
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  cretedAt: Date;
}
