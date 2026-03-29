const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks(
      id SERIAL PRIMARY KEY,
      title TEXT,
      status TEXT
    )
  `);
}

init();

app.get("/health", (req,res)=>{
  res.json({status:"OK"});
});

app.post("/tasks", async (req,res)=>{
  const {title,status} = req.body;

  const result = await pool.query(
    "INSERT INTO tasks(title,status) VALUES($1,$2) RETURNING *",
    [title,status]
  );

  res.json(result.rows[0]);
});

app.get("/tasks", async (req,res)=>{
  const result = await pool.query("SELECT * FROM tasks");
  res.json(result.rows);
});

app.listen(5000, ()=>{
  console.log("Backend running on port 5000");
});