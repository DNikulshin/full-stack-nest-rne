import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users/users.service';
import { PrismaService } from './prisma.service';
import { MailService } from './mail/mail.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let mailService: MailService;
  let configService: ConfigService;

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

  // Expected user without password field (what the service should return)
  const expectedUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    isActive: true,
    refreshToken: null,
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockMailService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:5173'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(email, password, name);
      
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: expect.any(String),
          name,
        },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';
      const name = 'Test User';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(email, password, name)).rejects.toThrow(ConflictException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(email);
      
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOneByEmail(email);
      
      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('findOneById', () => {
    it('should return user by id', async () => {
      const id = '1';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneById(id);
      
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id } });
    });

    it('should return null if user not found', async () => {
      const id = 'nonexistent';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOneById(id);
      
      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email', async () => {
      const email = 'test@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        refreshToken: 'reset-token',
      });
      mockMailService.sendMail.mockResolvedValue(undefined);

      await service.requestPasswordReset(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          refreshToken: expect.any(String),
          updatedAt: expect.any(Date),
        },
      });
      expect(mailService.sendMail).toHaveBeenCalled();
    });

    it('should not reveal if user does not exist', async () => {
      const email = 'nonexistent@example.com';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await service.requestPasswordReset(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(prismaService.user.update).not.toHaveBeenCalled();
      expect(mailService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const token = 'valid-token';
      const newPassword = 'newpassword123';
      const userId = '1';
      const userWithToken = {
        ...mockUser,
        refreshToken: token,
        updatedAt: new Date(Date.now() + 3600000), // 1 hour in the future
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithToken);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: 'newHashedPassword',
        refreshToken: null,
      });

      await service.resetPassword(token, newPassword, userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          password: expect.any(String),
          refreshToken: null,
        },
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      const token = 'invalid-token';
      const newPassword = 'newpassword123';
      const userId = '1';

      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        refreshToken: 'valid-token',
      });

      await expect(service.resetPassword(token, newPassword, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      const token = 'valid-token';
      const newPassword = 'newpassword123';
      const userId = '1';
      const userWithExpiredToken = {
        ...mockUser,
        refreshToken: token,
        updatedAt: new Date(Date.now() - 3600000), // 1 hour in the past
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithExpiredToken);

      await expect(service.resetPassword(token, newPassword, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user not found', async () => {
      const token = 'valid-token';
      const newPassword = 'newpassword123';
      const userId = 'nonexistent';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword, userId)).rejects.toThrow(BadRequestException);
    });
  });
});