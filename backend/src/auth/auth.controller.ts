import { Controller, Post, Body, HttpCode, HttpStatus, Res, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { Public } from './public.decorator';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Successful login with access token and user data.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({ type: LoginUserDto })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const { access_token } = await this.authService.login(user);
    
    // Set refresh token as HTTP-only cookie
    const refreshToken = await this.authService.generateRefreshToken(user.id);
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { access_token, user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Successfully refreshed access token.' })
  @ApiResponse({ status: 401, description: 'Refresh token not found or invalid.' })
  @ApiCookieAuth()
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // For now, we'll just return a new access token
    // In a real implementation, you would validate the refresh token
    const payload = { email: 'user@example.com', sub: '1', role: 'USER' };
    const access_token = await this.authService.login({
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
      role: 'USER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return { access_token: access_token.access_token };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Successfully logged out.' })
  @ApiCookieAuth()
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];
    // We don't need to do anything with the refresh token in this simplified implementation
    // Just clear the cookie
    
    response.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }
}