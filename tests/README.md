# Testing plan

Use Postman first, then add integration tests with Node's test runner and Supertest.

Minimum test cases:
1. Health endpoint returns 200.
2. Register valid user returns 201 and a token.
3. Register duplicate email returns 409.
4. Login with wrong password returns 401.
5. Creating an item without a token returns 401.
6. Authenticated user can create a valid LOST and FOUND report.
7. Invalid item payload returns 400.
8. Public search and filters return matching reports and pagination metadata.
9. Unknown item ID returns 404.
10. Owner can edit, recover, and delete their report.
11. Different user receives 403 when trying to edit, recover, or delete someone else's report.
12. Recovering an already recovered report returns 400.

For a polished submission, implement these as automated tests using a separate test database so test data never touches development data.
