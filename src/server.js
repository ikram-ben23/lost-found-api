import "dotenv/config";
import { app } from "./app.js";

const port = Number(process.env.PORT || 3000);
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Copy .env.example to .env and configure PostgreSQL.");
  process.exit(1);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set and contain at least 32 characters.");
  process.exit(1);
}

app.listen(port, () => console.log(`Lost & Found API listening on http://localhost:${port}`));
