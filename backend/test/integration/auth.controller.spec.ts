import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { User } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'USER',
    isActive: true,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  const mockRequest = {
    cookies: {
      refreshToken: 'refresh-token',
    },
  } as unknown as Request;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login user and set refresh token cookie', async () => {
      const loginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginResult = {
        access_token: 'access-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(loginResult);
      mockAuthService.generateRefreshToken.mockResolvedValue('refresh-token');

      const result = await controller.login(loginUserDto, mockResponse);

      expect(result).toEqual(loginResult);
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginUserDto.email,
        loginUserDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(authService.generateRefreshToken).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        {
          httpOnly: true,
          secure: undefined,
          sameSite: 'strict',
          maxAge: 604800000,
        },
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginUserDto, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginUserDto.email,
        loginUserDto.password,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh access token', async () => {
      const loginResult = {
        access_token: 'new-access-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.refresh(mockRequest, mockResponse);

      expect(result).toEqual({
        access_token: 'new-access-token',
      });
    });

    it('should throw UnauthorizedException if refresh token not found', async () => {
      const requestWithoutToken = {
        cookies: {},
      } as unknown as Request;

      await expect(
        controller.refresh(requestWithoutToken, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token cookie', async () => {
      const result = await controller.logout(mockRequest, mockResponse);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
    });
  });
});