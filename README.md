
## Description

**ra application**

## Installation

```bash
$ npm install
```
Then install PostgreSQL and then create 2 databases. (For example, **ra_app** and **ra_app_test**)

## Config environment

```bash
$ cp .env.example .env
```
### Update .env
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database # ra_app
DB_TEST_DATABASE=your_test_database # ra_app_test

# Auth
JWT_SECRET_KEY=your_test_key # ex: ra
JWT_EXPIRATION_TIME=your_test_time # ex: 3600000
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Technologies Used

[Nest](https://nestjs.com/), [Passport-jwt](https://www.passportjs.org/packages/passport-jwt/), [PostgreSQL](https://www.postgresql.org/), [NodeJS](https://nodejs.org/), [TypeORM](https://typeorm.io/), [Jest](https://jestjs.io/), E2E Testing, Unit Testing
