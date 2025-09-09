import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'uuid-reset-token',
    description: 'The reset token sent to the user email',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'user-id-123',
    description: 'The ID of the user',
  })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'The new password (min 6 characters)',
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}