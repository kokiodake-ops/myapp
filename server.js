const express = require("express");
const Database = require("better-sqlite3");
const app = express();

const db = new Database("books.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    memo TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static("public"));

app.get("/api/books", (req, res) => {
  const books = db.prepare("SELECT * FROM books ORDER BY id DESC").all();
  res.json(books);
});

app.post("/api/books", (req, res) => {
  db.prepare("INSERT INTO books (title, memo) VALUES (?, ?)")
    .run(req.body.title, req.body.memo);
  res.json({ ok: true });
});

app.delete("/api/books/:id", (req, res) => {
  db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.listen(3000, () => console.log("http://localhost:3000"));