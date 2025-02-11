import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('verification_tokens')
export class VerificationTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.verificationTokens)
  user: UserEntity;
}