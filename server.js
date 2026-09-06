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
  const q = req.query.q || "";
  const sortMap = {
    new: "created_at DESC",
    old: "created_at ASC",
    title: "title ASC",
    read: "read_on DESC NULLS LAST"
  };
  const order = sortMap[req.query.sort] || sortMap.new;

  const result = await pool.query(
    `SELECT * FROM books
     WHERE title ILIKE $1 OR memo ILIKE $1 OR author ILIKE $1
     ORDER BY ${order}`,
    ["%" + q + "%"]
  );
  res.json(result.rows);
});

app.post("/api/books", async (req, res) => {
  await pool.query(
    `INSERT INTO books (title, memo, author, read_on)
     VALUES ($1, $2, $3, $4)`,
    [req.body.title, req.body.memo, req.body.author, req.body.read_on || null]
  );
  res.json({ ok: true });
});

app.delete("/api/books/:id", async (req, res) => {
  await pool.query("DELETE FROM books WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("running on port " + port));