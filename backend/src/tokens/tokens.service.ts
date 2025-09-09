import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async generateAccessToken(userId: string, email: string, role: string): Promise<string> {
    const payload = { email, sub: userId, role };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      secret: process.env.JWT_SECRET,
    });
  }

  async generateRefreshToken(userId: string): Promise<{ token: string; hashedToken: string }> {
    const payload = { sub: userId };
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });
    
    // Hash the refresh token for storage
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    
    return { token: refreshToken, hashedToken };
  }

  async storeRefreshToken(userId: string, hashedToken: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.refreshToken) {
        return false;
      }
      
      return await bcrypt.compare(refreshToken, user.refreshToken);
    } catch {
      return false;
    }
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}