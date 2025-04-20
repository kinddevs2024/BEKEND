const express = require("express");
const serverless = require("serverless-http");
const fs = require("fs").promises;
const path = require("path");

const app = express();

// ✅ Manual CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://archlab.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const usersPath = path.join(__dirname, "../database/users.json");

// Utility function to validate request body
function validateRequestBody(body) {
  const { email, password } = body;
  if (!email || !password) {
    return "Email and password are required";
  }
  return null;
}

async function fileRead(path) {
  try {
    const data = await fs.readFile(path, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error reading file at ${path}: ${error.message}`);
  }
}

app.post("/api/users", async (req, res) => {
  try {
    const validationError = validateRequestBody(req.body);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const { email, password } = req.body;
    const users = await fileRead(usersPath);

    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Avoid exposing sensitive user data
    const { password: _, ...safeUser } = user;

    res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error("Full Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports.handler = serverless(app);
