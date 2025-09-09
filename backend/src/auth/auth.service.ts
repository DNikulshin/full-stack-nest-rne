import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { TokensService } from '../tokens/tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly tokensService: TokensService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as User;
    }
    return null;
  }

  async login(user: User) {
    const access_token = await this.tokensService.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );
    
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async generateRefreshToken(userId: string) {
    const { token, hashedToken } = await this.tokensService.generateRefreshToken(userId);
    await this.tokensService.storeRefreshToken(userId, hashedToken);
    return token;
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<User | null> {
    const isValid = await this.tokensService.validateRefreshToken(userId, refreshToken);
    if (!isValid) {
      return null;
    }
    
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return null;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, refreshToken: __, ...result } = user;
    return result as User;
  }
  
  async logout(userId: string): Promise<void> {
    await this.tokensService.removeRefreshToken(userId);
  }
}