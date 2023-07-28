# Auth API - README

This API provides user authentication functionalities using Node.js, Express.js, JWT (JSON Web Tokens) for access and refresh tokens, and a SQL database managed with Prisma. It allows users to sign up, log in, log out, and refresh their access tokens.

## Getting Started

To get started with this project, follow the steps below:

1. Clone the repository from GitHub:
```bash
git clone https://github.com/cantsaydorifto/auth-api.git
```
2. Install the dependencies:
```bash
cd auth-api
npm install
```

3. Create a `.env` file in the root directory of the project and provide the necessary environment variables:
```bash
DATABASE_URL=your_sql_database_connection_string
PORT=your_preferred_port_number
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

```
4. Set up the SQL database using Prisma migration:
```bash
npx prisma migrate dev
```
5. Start the server:
```bash
npm start
```

Now, the API should be up and running on the specified port, and you can start using the endpoints.

## Endpoints

### 1. POST `/api/user/signup`

This endpoint allows users to sign up by providing a username and password in the request body. After successful registration, the user's credentials will be stored in the database, and they will be able to log in.

### 2. POST `/api/user/login`

Users can log in using this endpoint. They need to provide their username and password in the request body. Upon successful authentication, the API will generate access and refresh tokens, which will be used for subsequent API requests.

### 3. POST `/api/logout`

When users want to log out, they can use this endpoint to invalidate their refresh token. This will effectively log them out from the system and revoke their access to protected resources.

### 4. GET `/api/refresh`

This endpoint is used for refreshing the access token. Users need to provide a valid refresh token in the request body, and if it is valid, a new access token will be generated, allowing them to continue accessing protected routes without the need for reauthentication.

## Environment Variables

The `.env` file is crucial for configuring the application with your specific environment. Here are the environment variables that need to be set:

- `DATABASE_URL`: The connection string for your SQL database (e.g., PostgreSQL, MySQL, SQLite). Make sure to replace `your_sql_database_connection_string` with the actual URL.

- `PORT`: The port number on which the server will run. Replace `your_preferred_port_number` with the desired port (e.g., 3000).

- `JWT_SECRET`: The secret key used to sign the JWT access tokens. Choose a strong and secure key for this variable.

- `JWT_REFRESH_SECRET`: The secret key used to sign the JWT refresh tokens. It should also be a strong and secure key.

