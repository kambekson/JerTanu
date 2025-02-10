import { AfterInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VerificationTokenEntity } from './verification-token.entity';
import { PasswordResetTokenEntity } from './password-reset-token.entity';

@Entity({
  name: 'users',
})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @OneToMany(() => VerificationTokenEntity, (token) => token.user)
  verificationTokens: VerificationTokenEntity[];

  @OneToMany(() => PasswordResetTokenEntity, (token) => token.user)
  passwordResetTokens: PasswordResetTokenEntity[];

  @AfterInsert()
  afterCreate() {
    console.log(`User with email ${this.email} has been created.`);
  }
}
