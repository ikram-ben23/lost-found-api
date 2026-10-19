# Lost & Found API

A REST API for reporting lost and found items, searching and filtering reports, viewing details, editing a user's own reports, and marking an item as recovered.

## Features
- Register, log in, and obtain a signed JWT.
- Create `LOST` and `FOUND` reports.
- Public search, filters, sorting, and pagination.
- View a report's details.
- Update/delete only reports owned by the authenticated user.
- Mark a report recovered and record its recovery time.
- Input validation, password hashing, centralized errors, security headers, and rate limiting.

## Stack
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT authentication + bcrypt password hashing
- Zod input validation
- Helmet, CORS, express-rate-limit
- Node's built-in test runner / Supertest dependency

## Requirements
Install Node.js LTS and PostgreSQL.

## Setup (Windows PowerShell or terminal)
1. Extract the project and open a terminal in its folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a PostgreSQL database named `lost_found_db`. For example, in `psql`:
   ```sql
   CREATE DATABASE lost_found_db;
   ```
4. Copy `.env.example` to `.env`.
   On PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```
   Edit `DATABASE_URL` to match your PostgreSQL username/password. Replace `JWT_SECRET` with a long random secret (at least 32 characters). Never commit `.env`.
5. Create the tables:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
7. Open interactive documentation at `http://localhost:3000/api-docs`.
8. Check health:
   `GET http://localhost:3000/api/v1/health`

## Try it with Postman
1. `POST /api/v1/auth/register` with name, email, password.
2. Copy `data.token` from the response.
3. In Postman, set Authorization type to **Bearer Token** and paste the token.
4. `POST /api/v1/items` with a JSON item report.
5. Test public search using `GET /api/v1/items?q=laptop&type=LOST`.
6. Test ownership: register a second user and try editing the first user's report. The API should return `403 Forbidden`.
7. Mark your own report recovered with `PATCH /api/v1/items/:id/recover`.

## Project structure
```text
src/
  app.js                  Express middleware and route registration
  server.js               Environment checks and server startup
  lib/
    prisma.js             Shared database client
    async-handler.js      Async error forwarding
  middleware/
    auth.js               JWT authentication
    errors.js             Centralized error responses
  routes/
    auth.js               Register, login, current user
    items.js              Item report endpoints
  validation/
    auth.js               Authentication input schemas
    items.js              Item input/query schemas
prisma/
  schema.prisma           Database models, relations, indexes
docs/
  API.md                  Detailed endpoint documentation
```

## Design decisions worth explaining
- Reports have a `type` (`LOST` or `FOUND`) and a separate `status` (`OPEN` or `RECOVERED`). Type describes the report; status describes whether the problem is resolved.
- Public users can browse reports, but only authenticated users can create reports.
- Ownership is checked on every edit, recovery, and delete request.
- Passwords are hashed; they are never stored or returned as plaintext.
- Pagination limits responses and protects the API from huge list requests.
- The API returns consistent JSON error shapes and uses appropriate HTTP status codes.

## Before submitting
- [ ] Verify setup works on a clean machine.
- [ ] Test each endpoint and save a Postman collection.
- [ ] Add automated integration tests for auth, CRUD, validation, and ownership.
- [ ] Add screenshots of Postman requests to your report if allowed.
- [ ] Include a short architecture explanation and endpoint table in the submission.
- [ ] Do not commit `.env`, passwords, or real user data.

## Limitations / next improvements
- Email verification and password reset are not implemented.
- Image uploads are represented by an optional URL; file storage is not implemented.
- Automated end-to-end tests need a configured test database.
- A production deployment should use HTTPS, stricter CORS, monitoring, backups, and secret management.
