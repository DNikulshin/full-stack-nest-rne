import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens/tokens.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-refresh-token'),
  compare: jest.fn().mockResolvedValue(true),
}));

import * as bcrypt from 'bcrypt';

describe('TokensService', () => {
  let service: TokensService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'development-jwt-secret';
        case 'JWT_REFRESH_SECRET':
          return 'development-refresh-secret';
        case 'JWT_EXPIRES_IN':
          return '15m';
        default:
          return undefined;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should generate access token', async () => {
      const userId = '1';
      const email = 'test@example.com';
      const role = 'USER';
      const token = 'access-token';

      mockJwtService.sign.mockReturnValue(token);

      const result = await service.generateAccessToken(userId, email, role);
      
      expect(result).toBe(token);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email, sub: userId, role },
        {
          expiresIn: '15m',
          secret: 'development-jwt-secret',
        },
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token and hash it', async () => {
      const userId = '1';
      const token = 'refresh-token';
      const hashedToken = 'hashed-refresh-token';

      mockJwtService.sign.mockReturnValue(token);
      
      // Mock bcrypt.hash to return a resolved promise
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(hashedToken);

      const result = await service.generateRefreshToken(userId);
      
      expect(result).toEqual({
        token,
        hashedToken,
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: userId },
        {
          expiresIn: '7d',
          secret: 'development-refresh-secret',
        },
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(token, 10);
    });
  });

  describe('storeRefreshToken', () => {
    it('should store refresh token in database', async () => {
      const userId = '1';
      const hashedToken = 'hashed-refresh-token';

      mockPrismaService.user.update.mockResolvedValue({});

      await service.storeRefreshToken(userId, hashedToken);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: hashedToken },
      });
    });
  });

  describe('validateRefreshToken', () => {
    it('should return true for valid refresh token', async () => {
      const userId = '1';
      const refreshToken = 'refresh-token';
      const hashedToken = 'hashed-refresh-token';

      mockPrismaService.user.findUnique.mockResolvedValue({
        refreshToken: hashedToken,
      });
      
      // Mock bcrypt.compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.validateRefreshToken(userId, refreshToken);
      
      expect(result).toBe(true);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(bcrypt.compare).toHaveBeenCalledWith(refreshToken, hashedToken);
    });

    it('should return false if user not found', async () => {
      const userId = 'nonexistent';
      const refreshToken = 'refresh-token';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateRefreshToken(userId, refreshToken);
      
      expect(result).toBe(false);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should return false if user has no refresh token', async () => {
      const userId = '1';
      const refreshToken = 'refresh-token';

      mockPrismaService.user.findUnique.mockResolvedValue({
        refreshToken: null,
      });

      const result = await service.validateRefreshToken(userId, refreshToken);
      
      expect(result).toBe(false);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should return false for invalid refresh token', async () => {
      const userId = '1';
      const refreshToken = 'invalid-refresh-token';
      const hashedToken = 'hashed-refresh-token';

      mockPrismaService.user.findUnique.mockResolvedValue({
        refreshToken: hashedToken,
      });
      
      // Mock bcrypt.compare to return false
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.validateRefreshToken(userId, refreshToken);
      
      expect(result).toBe(false);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(bcrypt.compare).toHaveBeenCalledWith(refreshToken, hashedToken);
    });
  });

  describe('removeRefreshToken', () => {
    it('should remove refresh token from database', async () => {
      const userId = '1';

      mockPrismaService.user.update.mockResolvedValue({});

      await service.removeRefreshToken(userId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: null },
      });
    });
  });
});