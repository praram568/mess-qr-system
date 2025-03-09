const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const XLSX = require("xlsx");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database("./students.db", (err) => {
  if (err) console.error(err.message);
  console.log("Connected to the database.");
});

// Create table
db.run(
  "CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, name TEXT, scanned_at TEXT)",
  (err) => {
    if (err) console.error(err.message);
  }
);

// API to store scanned QR code
app.post("/scan", (req, res) => {
  const { id, name } = req.body;
  const scannedAt = new Date().toISOString();

  db.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.json({ warning: "This student has already taken a meal!" });
    }

    db.run(
      "INSERT INTO students (id, name, scanned_at) VALUES (?, ?, ?)",
      [id, name, scannedAt],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: "Meal recorded successfully!" });
      }
    );
  });
});

// API to get scanned data
app.get("/data", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API to export data as Excel
app.get("/export", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    const filePath = "./students.xlsx";
    XLSX.writeFile(wb, filePath);

    res.download(filePath, "students.xlsx", () => {
      fs.unlinkSync(filePath); // Delete file after download
    });
  });
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:5000');
});


