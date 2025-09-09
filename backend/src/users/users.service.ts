import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create(email: string, password: string, name: string): Promise<Omit<User, 'password'>> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findOneByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findOneById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // We don't reveal whether the email exists or not for security reasons
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour
    
    // Store the reset token in the database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshToken: resetToken,
        updatedAt: resetTokenExpiry,
      },
    });

    // Get frontend URL from environment variables
    const frontendUrl = this.configService.get('frontend.url', 'http://localhost:5173');

    // Send reset email
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}&id=${user.id}`;
    
    await this.mailService.sendMail(
      user.email,
      'Password Reset Request',
      `You requested a password reset. Click here to reset your password: ${resetUrl}`,
      `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link will expire in 1 hour.</p>`,
    );
  }

  async resetPassword(token: string, newPassword: string, userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken || user.refreshToken !== token) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token has expired (using updatedAt as expiry time)
    if (new Date() > user.updatedAt) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        refreshToken: null,
      },
    });
  }
}