import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { User } from '@nestjs/common';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { RequestPasswordResetDto } from '../../src/users/dto/request-password-reset.dto';
import { ResetPasswordDto } from '../../src/users/dto/reset-password.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    isActive: true,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    findAll: jest.fn(),
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.password,
        createUserDto.name,
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset', async () => {
      const requestPasswordResetDto: RequestPasswordResetDto = {
        email: 'test@example.com',
      };

      mockUsersService.requestPasswordReset.mockResolvedValue(undefined);

      const result = await controller.requestPasswordReset(requestPasswordResetDto);

      expect(result).toEqual({
        message: 'If the email exists, a password reset link has been sent.',
      });
      expect(usersService.requestPasswordReset).toHaveBeenCalledWith(
        requestPasswordResetDto.email,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'reset-token',
        userId: '1',
        newPassword: 'newpassword123',
      };

      mockUsersService.resetPassword.mockResolvedValue(undefined);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual({
        message: 'Password has been reset successfully.',
      });
      expect(usersService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
        resetPasswordDto.userId,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });
});