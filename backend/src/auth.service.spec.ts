import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { TokensService } from './tokens/tokens.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let tokensService: TokensService;

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

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockTokensService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    storeRefreshToken: jest.fn(),
    validateRefreshToken: jest.fn(),
    removeRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TokensService, useValue: mockTokensService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    tokensService = module.get<TokensService>(TokensService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await service.validateUser(email, password);
      
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        isActive: true,
        refreshToken: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(email, password);
      
      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return null if password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('password123', 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await service.validateUser(email, password);
      
      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('login', () => {
    it('should generate access token and return user data', async () => {
      const accessToken = 'access-token';
      mockTokensService.generateAccessToken.mockResolvedValue(accessToken);

      const result = await service.login(mockUser);
      
      expect(result).toEqual({
        access_token: accessToken,
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      });
      expect(tokensService.generateAccessToken).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate and store refresh token', async () => {
      const userId = '1';
      const refreshToken = 'refresh-token';
      const hashedToken = 'hashed-refresh-token';

      mockTokensService.generateRefreshToken.mockResolvedValue({
        token: refreshToken,
        hashedToken,
      });
      mockTokensService.storeRefreshToken.mockResolvedValue(undefined);

      const result = await service.generateRefreshToken(userId);
      
      expect(result).toBe(refreshToken);
      expect(tokensService.generateRefreshToken).toHaveBeenCalledWith(userId);
      expect(tokensService.storeRefreshToken).toHaveBeenCalledWith(userId, hashedToken);
    });
  });

  describe('validateRefreshToken', () => {
    it('should return user if refresh token is valid', async () => {
      const userId = '1';
      const refreshToken = 'refresh-token';

      mockTokensService.validateRefreshToken.mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateRefreshToken(userId, refreshToken);
      
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(tokensService.validateRefreshToken).toHaveBeenCalledWith(userId, refreshToken);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should return null if refresh token is invalid', async () => {
      const userId = '1';
      const refreshToken = 'invalid-refresh-token';

      mockTokensService.validateRefreshToken.mockResolvedValue(false);

      const result = await service.validateRefreshToken(userId, refreshToken);
      
      expect(result).toBeNull();
      expect(tokensService.validateRefreshToken).toHaveBeenCalledWith(userId, refreshToken);
    });

    it('should return null if user not found', async () => {
      const userId = 'nonexistent';
      const refreshToken = 'refresh-token';

      mockTokensService.validateRefreshToken.mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateRefreshToken(userId, refreshToken);
      
      expect(result).toBeNull();
      expect(tokensService.validateRefreshToken).toHaveBeenCalledWith(userId, refreshToken);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });
});