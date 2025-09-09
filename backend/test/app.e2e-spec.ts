import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser.default());
    await app.init();
  });

  it('/ (GET)', () => {
    return request.default(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});