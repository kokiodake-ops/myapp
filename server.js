const express = require("express");
const { Pool } = require("pg");
const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false }
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      memo TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
init();

app.use(express.json());
app.use(express.static("public"));

app.get("/api/books", async (req, res) => {
  const result = await pool.query("SELECT * FROM books ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/api/books", async (req, res) => {
  await pool.query(
    "INSERT INTO books (title, memo) VALUES ($1, $2)",
    [req.body.title, req.body.memo]
  );
  res.json({ ok: true });
});

app.delete("/api/books/:id", async (req, res) => {
  await pool.query("DELETE FROM books WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("running on port " + port));