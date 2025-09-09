<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Backend Services Setup

This project uses Docker Compose to manage all backend services including the database, database admin panel, and mail server.

## Services

1. **PostgreSQL Database**
   - Version: Latest
   - Port: 5433 (host) -> 5432 (container)
   - Database: postgres
   - User: postgres
   - Password: postgres

2. **Database Admin Panel (Adminer)**
   - Port: 8080
   - Access: http://localhost:8080
   - Server: db (internal Docker service name)
   - Username: postgres
   - Password: postgres
   - Database: postgres

3. **Mail Server (MailHog)**
   - SMTP Port: 1025 (host) -> 1025 (container)
   - Web UI Port: 8025 (host) -> 8025 (container)
   - Access: http://localhost:8025

## Environment Configuration

The application supports different environments:

### Development Mode
- Uses Docker containers for all services
- Configuration loaded from `.env.development`
- Mail service uses MailHog for email interception
- Database runs in a Docker container
- Frontend URL defaults to `http://localhost:5173`

### Production Mode
- Configuration loaded from `.env.production`
- Uses real SMTP server for email sending
- Connects to production database
- Frontend URL must be configured

### Environment Variables

The following environment variables can be configured:

#### Database
- `DATABASE_URL`: PostgreSQL connection string

#### Mail
- `MAIL_HOST`: SMTP server hostname
- `MAIL_PORT`: SMTP server port
- `MAIL_SECURE`: Whether to use SSL/TLS
- `MAIL_USER`: SMTP username
- `MAIL_PASS`: SMTP password
- `MAIL_FROM`: Default sender email address
- `MAIL_FORWARD_TO`: Optional email address to forward all emails to

#### JWT
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_REFRESH_SECRET`: Secret key for refresh token signing
- `JWT_EXPIRES_IN`: Access token expiration time

#### Application
- `NODE_ENV`: Environment mode (development/production)
- `FRONTEND_URL`: URL of the frontend application (used for password reset links)

To switch between environments, set the `NODE_ENV` environment variable:
```bash
# Development (default)
export NODE_ENV=development

# Production
export NODE_ENV=production
```

## Usage

### Starting Services

```bash
# Windows
.\start-all.bat

# Or directly with Docker Compose
docker-compose up -d
```

The start script will automatically check the availability of all services before completing.

### Stopping Services

```bash
# Windows
.\stop-all.bat

# Or directly with Docker Compose
docker-compose down
```

## Health Checks

The services include health checks to ensure they're running properly:
- Database: Uses `pg_isready` to check PostgreSQL readiness
- Database Admin Panel: Checks HTTP response
- Mail Server: Checks if the web UI is accessible

## Volumes

- `postgres_data`: Persists PostgreSQL data
- `mailhog_data`: Persists MailHog email data

## Troubleshooting

If you encounter version compatibility issues with the database, you may need to remove the volumes:
```
docker-compose down -v
```

Then start the services again:
```bash
docker-compose up -d
```

If you encounter migration issues with Prisma, you can use the direct database push approach:
```bash
npx prisma db push
```

This bypasses the migration system and directly applies the schema to the database.

## Service Access

After starting the services, you can access:

1. **Database Admin Panel**: http://localhost:8080
   - System: PostgreSQL
   - Server: db
   - Username: postgres
   - Password: postgres
   - Database: postgres

2. **Mail Server Web UI**: http://localhost:8025
   - View captured emails sent by the application
   - Test email functionality during development

## Database Setup

The project uses Prisma as the ORM for database operations. The database schema is defined in `prisma/schema.prisma`.

### Initializing the Database

To set up the database for the first time, run:
```bash
npx prisma db push
```

This command directly applies the schema to the database without using migrations, which can help avoid issues with PostgreSQL collation version mismatches.

### Working with Migrations

For production environments, it's recommended to use migrations:
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy
```

If you encounter migration errors due to existing objects in the database, you may need to reset the database:
```bash
# Reset the database (removes all data)
npx prisma migrate reset --force
```

Note: If you encounter collation version mismatch errors with PostgreSQL, use `npx prisma db push` instead of the migration commands.

## Email Configuration

### Development
In development mode, the application uses MailHog to intercept and display emails:
- SMTP Server: localhost:1025
- Web Interface: http://localhost:8025

### Production
In production mode, the application connects directly to your SMTP server using credentials from environment variables:
- MAIL_HOST: SMTP server hostname
- MAIL_PORT: SMTP server port
- MAIL_SECURE: Whether to use TLS (true/false)
- MAIL_USER: SMTP username
- MAIL_PASS: SMTP password
- MAIL_FROM: Default sender address

The start-all.bat script will verify that all services are accessible before completing, ensuring that your development environment is ready.