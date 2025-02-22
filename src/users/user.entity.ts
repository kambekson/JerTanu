import { AfterInsert, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";
import { TourEntity } from "../tour/tour.entity";
import { ProfileEntity } from "../profiles/entities/profile.entity";
import { PasswordResetTokenEntity } from "src/email/password-reset-token.entity";
import { VerificationTokenEntity } from "src/email/verification-token.entity";

@Entity({
  name: "users"
})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @OneToMany(() => TourEntity, (tour) => tour.user)
  tours: TourEntity[]

  @OneToOne(() => ProfileEntity, profile => profile.user)
  @JoinColumn()
  profile: ProfileEntity;

  @OneToMany(() => VerificationTokenEntity, (token) => token.user)
  verificationTokens: VerificationTokenEntity[];

  @OneToMany(() => PasswordResetTokenEntity, (token) => token.user)
  passwordResetTokens: PasswordResetTokenEntity[];

  @AfterInsert()
  afterCreate() {
    console.log(`User with email ${this.email} has been created.`);
  }
}
