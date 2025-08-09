# RESTful API Node Server Boilerplate

A boilerplate/starter project for quickly building RESTful APIs using [Node.js](https://nodejs.org), [TypeScript](https://www.typescriptlang.org), [Express](https://expressjs.com), and [Prisma](https://www.prisma.io).

This project is an adaptation of the project [RESTful API Node Server Boilerplate](https://github.com/hagopj13/node-express-boilerplate) using a [PostgreSQL](https://www.postgresql.org) database with [Prisma](https://www.prisma.io) ORM. Many of the files are just an adaptation to [TypeScript](https://www.typescriptlang.org) from the files of the previously mentioned project.

## Quick Start

Clone the repo:

```bash
git clone --depth 1 https://github.com/KalabAmssalu/backend_template.git
cd backend_template
npx rimraf ./.git
```

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Table of Contents

- [RESTful API Node Server Boilerplate](#restful-api-node-server-boilerplate)
  - [Quick Start](#quick-start)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Commands](#commands)
  - [Environment Variables](#environment-variables)
  - [Email Configuration](#email-configuration)
  - [Project Structure](#project-structure)
  - [API Documentation](#api-documentation)
    - [API Endpoints](#api-endpoints)
  - [Error Handling](#error-handling)
  - [Validation](#validation)
  - [Authentication](#authentication)
  - [Authorization](#authorization)
  - [Logging](#logging)
  - [Linting](#linting)
  - [Contributing](#contributing)
  - [Inspirations](#inspirations)
  - [License](#license)

## Features

- **SQL database**: [PostgreSQL](https://www.postgresql.org) object data modeling using [Prisma](https://www.prisma.io) ORM
- **Authentication and authorization**: using [passport](http://www.passportjs.org) with session-based authentication
- **Validation**: request data validation using [Joi](https://joi.dev)
- **Logging**: using [winston](https://github.com/winstonjs/winston) and [morgan](https://github.com/expressjs/morgan)
- **Email service**: using [Brevo](https://www.brevo.com) for transactional emails
- `future` **Testing**: unit and integration tests using [Jest](https://jestjs.io)
- **Error handling**: centralized error handling mechanism
- **API documentation**: with [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) and [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)
- **Process management**: advanced production process management using [PM2](https://pm2.keymetrics.io)
- **Dependency management**: with [Yarn](https://yarnpkg.com)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **Security**: set security HTTP headers using [helmet](https://helmetjs.github.io)
- **Santizing**: sanitize request data against xss and query injection
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **Compression**: gzip compression with [compression](https://github.com/expressjs/compression)
- **Docker support**
- **Code coverage**: using [coveralls](https://coveralls.io)
- **Code quality**: with [Codacy](https://www.codacy.com)
- **Git hooks**: with [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)
- **Editor config**: consistent editor configuration using [EditorConfig](https://editorconfig.org)

## Commands

Running locally:

```bash
yarn dev
```

Running in production:

```bash
yarn start
```

Testing:

```bash
# run all tests
yarn test

# run all tests in watch mode
yarn test:watch

# run test coverage
yarn coverage
```

Testing Email Configuration:

```bash
# Test Brevo email configuration
ts-node scripts/test-email.ts your-email@example.com
```

Database:

```bash
# push changes to db
yarn db:push

# start prisma studio
yarn db:studio
```

Docker:

```bash
# run docker container in development mode
yarn docker:dev

# run docker container in production mode
yarn docker:prod

# run all tests in a docker container
yarn docker:test

# run docker container with PostgreSQL db
yarn docker:dev-db:start

# stop docker container with PostgreSQL db
yarn docker:dev-db:stop
```

Linting:

```bash
# run ESLint
yarn lint

# fix ESLint errors
yarn lint:fix

# run prettier
yarn prettier

# fix prettier errors
yarn prettier:fix
```

## Testing

The project includes a comprehensive test suite using Jest. There are multiple ways to run tests:

### Test Environment Setup

Before running tests locally, you can verify your test environment is correctly configured:

```bash
# Check test environment configuration
yarn test:setup
```

This script will:

- Create a `.env.test` file if it doesn't exist
- Verify all required environment variables are set
- Check database connectivity
- Validate that the test database is accessible

The `.env.test` file contains environment variables specifically for testing. The setup script will create this file with default values if it doesn't exist, but you can customize it according to your needs.

Key environment variables for testing:

```
# Database connection
TEST_DB_USER=postgres
TEST_DB_PASSWORD=postgres
TEST_DB_NAME=test_db
TEST_DB_PORT=5433
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/test_db?schema=public

# Authentication
JWT_SECRET=test-jwt-secret-key-for-testing-purposes-only
SESSION_SECRET=test-session-secret-key-for-testing-purposes-only
```

### Running Tests with Docker

The simplest way to run tests is using Docker, which automatically sets up the test database and runs the test suite:

```bash
# Run tests in Docker (recommended for CI/CD)
yarn test:docker
```

This command uses `docker-compose.test.yml` to:

1. Start a PostgreSQL container with the test database
2. Run the test suite in a Node.js container
3. Automatically clean up all containers after tests complete

### Running Tests Locally

If you prefer to run tests locally:

```bash
# Run tests with automatic setup and teardown
yarn test:run
```

This command will:

1. Create `.env.test` file if needed
2. Start the test database
3. Push the schema to the database
4. Run tests
5. Stop the test database

You can also run the individual steps manually:

```bash
# Start the test database
yarn test:db:start

# Run tests
yarn test

# Stop the test database
yarn test:db:stop

# Or use the combined command
yarn test:local
```

### Development Testing

During development, you might want to run tests in watch mode:

```bash
# Run tests in watch mode with local database
yarn test:local:watch

# Or start the database separately
yarn test:db:start
yarn test:watch
```

### Test Coverage

To generate test coverage reports:

```bash
yarn test:coverage
```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# Port number
PORT=3000

# URL of the PostgreSQL database
DATABASE_URL=postgresql://postgres:secret@localhost:5432/mydb?schema=public

# Session
# Session secret key
SESSION_SECRET=thisisasamplesecret
# Session expiration time in milliseconds
SESSION_EXPIRATION=86400000

# SMTP configuration options for the email service
# For testing, you can use a fake SMTP service like Ethereal: https://ethereal.email/create
SMTP_HOST=email-server
SMTP_PORT=587
SMTP_USERNAME=email-server-username
SMTP_PASSWORD=email-server-password
EMAIL_FROM=support@yourapp.com

# Brevo email configuration
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=your-verified-email@yourdomain.com
BREVO_SENDER_NAME=Your Company Name
```

For testing, create a `.env.test` file with test-specific configurations:

```
NODE_ENV=test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=postgres
TEST_DB_NAME=test_db
TEST_DB_PORT=5433
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/test_db?schema=public
```

## Email Configuration

The application uses [Brevo](https://www.brevo.com) (formerly Sendinblue) for sending transactional emails.

### Brevo Setup

1. Create a Brevo account at [https://www.brevo.com/](https://www.brevo.com/)
2. Generate an API key from the Brevo dashboard
3. Verify your sender email address in the Brevo dashboard
4. Add the following environment variables to your `.env` file:

```bash
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=your-verified-email@yourdomain.com
BREVO_SENDER_NAME=Your Company Name
```

### Testing Email Configuration

You can test your Brevo email configuration using the provided test script:

```bash
ts-node scripts/test-email.ts your-email@example.com
```

For more detailed information about the Brevo email implementation, refer to the [Brevo Email Setup Documentation](docs/brevo-email-setup.md).

## Project Structure

```
src\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--docs\           # Swagger files
 |--middlewares\    # Custom express middlewares
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--index.js        # App entry point
```

## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:3000/v1/docs` in your browser. This documentation page is automatically generated using the [swagger](https://swagger.io/) definitions written as comments in the route files.

### API Endpoints

List of available routes:

**Auth routes**:\
`POST /v1/auth/register` - register\
`POST /v1/auth/login` - login\
`POST /v1/auth/refresh-tokens` - refresh auth tokens\
`POST /v1/auth/forgot-password` - send reset password email\
`POST /v1/auth/reset-password` - reset password\
`POST /v1/auth/send-verification-email` - send verification email\
`POST /v1/auth/verify-email` - verify email

**User routes**:\
`POST /v1/users` - create a user\
`GET /v1/users` - get all users\
`GET /v1/users/:userId` - get user\
`PATCH /v1/users/:userId` - update user\
`DELETE /v1/users/:userId` - delete user

## Error Handling

The app has a centralized error handling mechanism.

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

```javascript
const catchAsync = require('../utils/catchAsync');

const controller = catchAsync(async (req, res) => {
  // this error will be forwarded to the error handling middleware
  throw new Error('Something wrong happened');
});
```

The error handling middleware sends an error response, which has the following format:

```json
{
  "code": 404,
  "message": "Not found"
}
```

When running in development mode, the error response also contains the error stack.

The app has a utility ApiError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

For example, if you are trying to get a user from the DB who is not found, and you want to send a 404 error, the code should look something like:

```javascript
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
};
```

## Validation

Request data is validated using [Joi](https://joi.dev/). Check the [documentation](https://joi.dev/api/) for more details on how to write Joi validation schemas.

The validation schemas are defined in the `src/validations` directory and are used in the routes by providing them as parameters to the `validate` middleware.

```javascript
const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.post('/users', validate(userValidation.createUser), userController.createUser);
```

## Authentication

To require authentication for certain routes, you can use the `auth` middleware.

```javascript
const express = require('express');
const auth = require('../../middlewares/auth');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.post('/users', auth(), userController.createUser);
```

These routes require a valid session. If the request does not come from an authenticated session, an Unauthorized (401) error is thrown.

**Session-based Authentication**:

A session is created by making a successful call to the register (`POST /v1/auth/register`) or login (`POST /v1/auth/login`) endpoints. The session is stored on the server and a session ID is sent to the client as a cookie.

A session is valid for 24 hours by default. You can modify this expiration time by changing the `SESSION_EXPIRATION` environment variable in the .env file.

## Authorization

The `auth` middleware can also be used to require certain rights/permissions to access a route.

```javascript
const express = require('express');
const auth = require('../../middlewares/auth');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.post('/users', auth('manageUsers'), userController.createUser);
```

In the example above, an authenticated user can access this route only if that user has the `manageUsers` permission.

The permissions are role-based. You can view the permissions/rights of each role in the `src/config/roles.js` file.

If the user making the request does not have the required permissions to access this route, a Forbidden (403) error is thrown.

## Logging

Import the logger from `src/config/logger.js`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```javascript
const logger = require('<path to src>/config/logger');

logger.error('message'); // level 0
logger.warn('message'); // level 1
logger.info('message'); // level 2
logger.http('message'); // level 3
logger.verbose('message'); // level 4
logger.debug('message'); // level 5
```

In development mode, log messages of all severity levels will be printed to the console.

In production mode, only `info`, `warn`, and `error` logs will be printed to the console.\
It is up to the server (or process manager) to actually read them from the console and store them in log files.\
This app uses pm2 in production mode, which is already configured to store the logs in log files.

Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using [morgan](https://github.com/expressjs/morgan)).

## Linting

Linting is done using [ESLint](https://eslint.org/) and [Prettier](https://prettier.io).

In this app, ESLint is configured to follow the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base) with some modifications. It also extends [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to turn off all rules that are unnecessary or might conflict with Prettier.

To modify the ESLint configuration, update the `.eslintrc.json` file. To modify the Prettier configuration, update the `.prettierrc.json` file.

To prevent a certain file or directory from being linted, add it to `.eslintignore` and `.prettierignore`.

To maintain a consistent coding style across different IDEs, the project contains `.editorconfig`

## Contributing

Contributions are more than welcome! Please check out the [contributing guide](CONTRIBUTING.md).

## Inspirations

- [RESTful API Node Server Boilerplate](https://github.com/hagopj13/node-express-boilerplate)

## License

[MIT](LICENSE)
