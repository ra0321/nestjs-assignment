import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import { AuthModule } from '../../src/auth/auth.module';
import { CatsModule } from '../../src/cats/cats.module'

import { UserEntity } from '../../src/users/user.entity';
import { CatEntity } from '../../src/cats/cat.entity';

describe('Cat', () => {
  let app: INestApplication;
  let userRepo: Repository<UserEntity>;
  let catRepo: Repository<CatEntity>;
  
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
        CatsModule,
      ]
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    catRepo = module.get<Repository<CatEntity>>(getRepositoryToken(CatEntity));

    // register user with admin role
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: "Axe",
        email: "axe@g.com",
        password: "123",
        role: "Admin"
      })
      .expect(200);

    // register user with user role
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: "Phantom",
        email: "phantom@g.com",
        password: "1234",
        role: "User"
      })
      .expect(200);
  });
  
  afterAll(async () => {
    await userRepo.query(`DELETE FROM users;`);
    await app.close();
  });

  afterEach(async () => {
    await catRepo.query(`DELETE FROM cats;`);
  });

  describe('POST /cats', () => {
    it('should create new cat by user with admin role', async () => {
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      const { body } = await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      expect(body).toEqual({
        cat: {
          ...{
            name: "cat1",
            age: 2,
            breed: 'breed1'
          },
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      });
    });
    it('should not create new cat by user with user role', async () => {
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "phantom@g.com",
          password: "1234"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      const { body } = await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(403);

      expect(body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403
      });
    });
    it('should not create new cat by non-loggedin user', async () => {      
      const { body } = await request(app.getHttpServer())
        .post('/cats')
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(401);

      expect(body).toEqual({
        message: 'Unauthorized',
        statusCode: 401
      });
    });
  });

  describe('GET /cats', () => {
    it('should get cat list', async () => {
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat2',
          age: 2,
          breed: 'breed2'
        })
        .expect(200);

      const { body } = await request(app.getHttpServer())
        .get('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .expect(200);

      expect(body).toEqual([
        {
          ...{
            name: "cat1",
            age: "2",
            breed: 'breed1'
          },
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
        {
          ...{
            name: "cat2",
            age: "2",
            breed: 'breed2'
          },
          id: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      ]);
    });
    it('should not get cat list by non-loggedin user', async () => {      
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      const { body } = await request(app.getHttpServer())
        .get('/cats')
        .expect(401);

      expect(body).toEqual({
        message: 'Unauthorized',
        statusCode: 401
      });
    });
  });

  describe('GET /cats/{id}', () => {
    it('should get a cat', async () => {
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      const createResult = await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      const createBody = createResult.body;

      const { body } = await request(app.getHttpServer())
        .get(`/cats/${createBody.cat.id}`)
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .expect(200);

      expect(body.cat).toEqual({
        ...createBody.cat,
        ...{
          age: String(createBody.cat.age)
        }
      });
    });
    it('should not get a cat by non-loggedin user', async () => {      
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      const createResult = await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      const createBody = createResult.body;

      const { body } = await request(app.getHttpServer())
        .get(`/cats/${createBody.cat.id}`)
        .expect(401);

      expect(body).toEqual({
        message: 'Unauthorized',
        statusCode: 401
      });
    });
  });

  describe('PUT /cats/{id}', () => {
    it('should update a cat', async () => {
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      const createResult = await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      const createBody = createResult.body;

      const { body } = await request(app.getHttpServer())
        .put(`/cats/${createBody.cat.id}`)
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat2',
          age: 2,
          breed: 'breed2'
        })
        .expect(200);

      expect(body).toEqual({
        cat: {
          ...{
            name: "cat2",
            age: "2",
            breed: 'breed2',
            id: createBody.cat.id,
            createdAt: createBody.cat.createdAt,
          },
          updatedAt: expect.any(String)
        }
      });
    });
    it('should not update a cat by user with user role', async () => {
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      const createResult = await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      const createBody = createResult.body;

      const loginResult1 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "phantom@g.com",
          password: "1234"
        })
        .expect(200);
      
      const loginBody1 = loginResult1.body;

      const { body } = await request(app.getHttpServer())
        .put(`/cats/${createBody.cat.id}`)
        .set('Authorization', `Bearer ${loginBody1.token.accessToken}`)
        .send({
          name: 'cat2',
          age: 2,
          breed: 'breed2'
        })
        .expect(403);

      expect(body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403
      });
    });
    it('should not update a cat by non-loggedin user', async () => {      
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      const createResult = await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      const createBody = createResult.body;

      const { body } = await request(app.getHttpServer())
        .put(`/cats/${createBody.cat.id}`)
        .send({
          name: 'cat2',
          age: 2,
          breed: 'breed2'
        })
        .expect(401);

      expect(body).toEqual({
        message: 'Unauthorized',
        statusCode: 401
      });
    });
  });

  describe('DELETE /cats/{id}', () => {
    it('should delete a cat', async () => {
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      const createResult = await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      const createBody = createResult.body;

      const { body } = await request(app.getHttpServer())
        .delete(`/cats/${createBody.cat.id}`)
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .expect(200);

      expect(body).toEqual({
        deleted: true
      });
    });
    it('should not delete a cat by user with user role', async () => {
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      const createResult = await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      const createBody = createResult.body;

      const loginResult1 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "phantom@g.com",
          password: "1234"
        })
        .expect(200);
      
      const loginBody1 = loginResult1.body;

      const { body } = await request(app.getHttpServer())
        .delete(`/cats/${createBody.cat.id}`)
        .set('Authorization', `Bearer ${loginBody1.token.accessToken}`)
        .expect(403);

      expect(body).toEqual({
        error: 'Forbidden',
        message: 'Forbidden resource',
        statusCode: 403
      });
    });
    it('should not delete a cat by non-loggedin user', async () => {      
      const loginResult = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "axe@g.com",
          password: "123"
        })
        .expect(200);
      
      const loginBody = loginResult.body;
      
      const createResult = await request(app.getHttpServer())
        .post('/cats')
        .set('Authorization', `Bearer ${loginBody.token.accessToken}`)
        .send({
          name: 'cat1',
          age: 2,
          breed: 'breed1'
        })
        .expect(200);

      const createBody = createResult.body;

      const { body } = await request(app.getHttpServer())
        .delete(`/cats/${createBody.cat.id}`)
        .expect(401);

      expect(body).toEqual({
        message: 'Unauthorized',
        statusCode: 401
      });
    });
  });
});
