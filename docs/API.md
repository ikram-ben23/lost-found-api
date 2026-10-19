# Lost & Found API — endpoint reference

Base URL: `http://localhost:3000/api/v1`

Protected routes require this header:
`Authorization: Bearer <token>`

All request bodies are JSON. Successful responses use `success: true`; errors use `success: false`.

## Authentication

### `POST /auth/register`
```json
{
  "name": "Amina Benali",
  "email": "amina@example.com",
  "password": "StrongPass123"
}
```
Returns `201` with a safe user object and JWT token.

### `POST /auth/login`
```json
{
  "email": "amina@example.com",
  "password": "StrongPass123"
}
```
Returns a JWT token. Invalid credentials return `401`.

### `GET /auth/me`
Protected. Returns the currently authenticated user.

## Item reports

### `POST /items`
Protected. Create a lost or found report.
```json
{
  "type": "LOST",
  "title": "Black laptop bag",
  "description": "Black bag with a small blue keychain.",
  "category": "Bags",
  "location": "ESI Algiers library",
  "itemDate": "2026-10-17",
  "imageUrl": null
}
```
`type` must be `LOST` or `FOUND`. `status` starts as `OPEN`.

### `GET /items`
Public, paginated list and search.

Supported query parameters:
- `q`: keyword in title, description, category, or location
- `type`: `LOST` or `FOUND`
- `category`: partial category match
- `location`: partial location match
- `status`: `OPEN` or `RECOVERED`
- `from`, `to`: item date range (`YYYY-MM-DD`)
- `page`: page number, default `1`
- `limit`: page size, default `10`, maximum `100`
- `sort`: `newest` or `oldest`

Example:
`GET /items?type=FOUND&category=Electronics&location=library&page=1&limit=10`

### `GET /items/:id`
Public. Get one report with the owner's public name and ID.

### `PATCH /items/:id`
Protected. Update your own report. Send only fields to change, e.g.
```json
{
  "description": "Updated description with more details.",
  "location": "Main entrance",
  "status": "OPEN"
}
```
The report's `type` cannot be changed after creation. Only its owner can update it.

### `PATCH /items/:id/recover`
Protected. Mark your own report as recovered. Records `recoveredAt`.

### `DELETE /items/:id`
Protected. Delete your own report. Returns `204 No Content`.

## Status codes
- `200 OK`: successful read/update
- `201 Created`: resource created
- `204 No Content`: deleted successfully
- `400 Bad Request`: invalid input or invalid state transition
- `401 Unauthorized`: missing/invalid token or bad login
- `403 Forbidden`: authenticated user does not own the report
- `404 Not Found`: unknown route or report
- `409 Conflict`: duplicate registration email
- `500 Internal Server Error`: unexpected server error
