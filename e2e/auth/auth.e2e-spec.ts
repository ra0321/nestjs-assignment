import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import { AuthModule } from '../../src/auth/auth.module';

import { UserEntity } from '../../src/users/user.entity';
import { CatEntity } from '../../src/cats/cat.entity';
import exp from 'constants';

describe('Auth', () => {
  let app: INestApplication;
  let repo: Repository<UserEntity>;
  
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_TEST_DATABASE'),
            entities: [UserEntity, CatEntity],
            synchronize: true,
          }),
        }),
        AuthModule,
      ]
    }).compile();

    app = module.createNestApplication();
    await app.init();

    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });
  
  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await repo.query(`DELETE FROM users;`);
  });

  describe('POST /auth/register', () => {
    it('should register new user', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: "Axe",
          email: "axe@g.com",
          password: "123",
          role: "Admin"
        })
        .expect(200);
        
      expect(body).toEqual({
        user: {
          ...{
            name: "Axe",
            email: "axe@g.com",
            role: "Admin"
          },
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      });
    });
    it('should not register new user with the same email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: "Axe",
          email: "axe@g.com",
          password: "123",
          role: "Admin"
        })
        .expect(200);

      const { body } = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: "Axe",
          email: "axe@g.com",
          password: "123",
          role: "Admin"
        })
        .expect(400);
        
      expect(body).toEqual({
        message: 'User with that email already exists',
        error: 'Bad Request',
        statusCode: 400
      });
    });
  });

  describe('POST /auth/login', () => {
    it('should login with the existing user', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: "Axe",
          email: "axe@g.com",
          password: "123",
          role: "Admin"
        })
        .expect(200);

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
        
      expect(body).toEqual({
        user: {
          ...{
            name: "Axe",
            email: "axe@g.com",
            role: "Admin"
          },
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
        token: {
          expiresIn: expect.any(String),
          accessToken: expect.any(String)
        }
      });
    });
    it('should not login with the non-existing user', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: "Axe",
          email: "axe@g.com",
          password: "123",
          role: "Admin"
        })
        .expect(200);

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "phantom@g.com",
          password: "123"
        })
        .expect(401);
        
      expect(body).toEqual({
        message: 'Unauthorized',
        statusCode: 401
      });
    });
    it('should not login with the wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: "Axe",
          email: "axe@g.com",
          password: "123",
          role: "Admin"
        })
        .expect(200);

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "1234"
        })
        .expect(401);
        
      expect(body).toEqual({
        message: 'Unauthorized',
        statusCode: 401
      });
    });
  });
});
