import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';
import * as bcrypt from 'bcrypt';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser.default());
    await app.init();
    
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await prismaService.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'test2@example.com'],
        },
      },
    });
    await app.close();
  });

  describe('POST /auth/login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      // Clean up before each test
      await prismaService.user.deleteMany({
        where: {
          email: loginDto.email,
        },
      });
      
      // Create a test user
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      await prismaService.user.create({
        data: {
          email: loginDto.email,
          password: hashedPassword,
          name: 'Test User',
        },
      });
    });

    it('should login successfully and return access token', () => {
      return request.default(server)
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(loginDto.email);
          // Check that refresh token cookie is set
          expect(res.header['set-cookie']).toBeDefined();
          const cookies = res.header['set-cookie'];
          expect(cookies.some((cookie: string) => cookie.includes('refreshToken'))).toBe(true);
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request.default(server)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    const loginDto = {
      email: 'test2@example.com',
      password: 'password123',
    };

    let refreshToken: string;

    beforeEach(async () => {
      // Clean up before each test
      await prismaService.user.deleteMany({
        where: {
          email: loginDto.email,
        },
      });
      
      // Create a test user
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const user = await prismaService.user.create({
        data: {
          email: loginDto.email,
          password: hashedPassword,
          name: 'Test User 2',
        },
      });
      
      // Login to get refresh token
      const response = await request.default(server)
        .post('/auth/login')
        .send(loginDto)
        .expect(200);
      
      // Extract refresh token from cookies
      const cookies = response.header['set-cookie'];
      const refreshTokenCookie = cookies.find((cookie: string) => cookie.includes('refreshToken'));
      refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
    });

    it('should return 401 if no refresh token', () => {
      return request.default(server)
        .post('/auth/refresh')
        .expect(401);
    });

    it('should refresh token successfully', () => {
      // Set the refresh token cookie and make request
      return request.default(server)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });
  });

  describe('POST /auth/logout', () => {
    const loginDto = {
      email: 'test2@example.com',
      password: 'password123',
    };

    let cookies: string[];

    beforeEach(async () => {
      // Clean up before each test
      await prismaService.user.deleteMany({
        where: {
          email: loginDto.email,
        },
      });
      
      // Create a test user
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      await prismaService.user.create({
        data: {
          email: loginDto.email,
          password: hashedPassword,
          name: 'Test User 2',
        },
      });
      
      // Login to get refresh token
      const response = await request.default(server)
        .post('/auth/login')
        .send(loginDto)
        .expect(200);
        
      cookies = response.header['set-cookie'];
    });

    it('should logout successfully', () => {
      // Logout with cookies
      return request.default(server)
        .post('/auth/logout')
        .set('Cookie', cookies)
        .expect(200)
        .expect({
          message: 'Logged out successfully',
        });
    });
  });
});