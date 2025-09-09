import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

describe('UsersController (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser.default());
    await app.init();
    
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test users
    await prismaService.user.deleteMany({
      where: {
        email: {
          in: ['newuser@example.com', 'resetuser@example.com'],
        },
      },
    });
    await app.close();
  });

  describe('POST /users/register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    };

    beforeEach(async () => {
      // Clean up before each test
      await prismaService.user.deleteMany({
        where: {
          email: registerDto.email,
        },
      });
    });

    it('should register a new user', () => {
      return request.default(app.getHttpServer())
        .post('/users/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe(registerDto.email);
          expect(res.body.name).toBe(registerDto.name);
          // The password should not be returned in the response
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 409 if user already exists', async () => {
      // First, create the user
      await request.default(app.getHttpServer())
        .post('/users/register')
        .send(registerDto);

      // Try to create the same user again
      return request.default(app.getHttpServer())
        .post('/users/register')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('POST /users/request-password-reset', () => {
    const resetRequestDto = {
      email: 'resetuser@example.com',
    };

    beforeEach(async () => {
      // Create a test user
      await prismaService.user.create({
        data: {
          email: resetRequestDto.email,
          password: 'hashedPassword',
          name: 'Reset User',
        },
      });
    });

    it('should request password reset', () => {
      return request.default(app.getHttpServer())
        .post('/users/request-password-reset')
        .send(resetRequestDto)
        .expect(201)
        .expect({
          message: 'If the email exists, a password reset link has been sent.',
        });
    }, 10000); // Increase timeout to 10 seconds
  });

  describe('PUT /users/reset-password', () => {
    it('should return 400 for invalid reset token', () => {
      const resetDto = {
        token: 'invalid-token',
        userId: 'nonexistent',
        newPassword: 'newpassword123',
      };

      return request.default(app.getHttpServer())
        .put('/users/reset-password')
        .send(resetDto)
        .expect(400);
    });
  });

  describe('GET /users/profile', () => {
    it('should return 403 if not authenticated', () => {
      return request.default(app.getHttpServer())
        .get('/users/profile')
        .expect(403); // The global guard returns 403 instead of 401
    });
  });
});