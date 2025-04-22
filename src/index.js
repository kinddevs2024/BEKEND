import express from "express";
import serverless from "serverless-http";
import { promises as fs } from "fs";
import path from "path";

const app = express();

// ✅ Manual CORS headers for Vercel
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://archlab.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


const usersPath = path.join(__dirname, "../database/users.json"); // Ensure path is correct

// Utility function to validate request body
function validateRequestBody(body) {
  const { email, password } = body;
  if (!email || !password) {
    return "Email and password are required";
  }
  return null;
}

// Function to read the JSON file
async function fileRead(path) {
  try {
    const data = await fs.readFile(path, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error reading file at ${path}: ${error.message}`);
  }
}

// POST /api/users - User authentication endpoint
app.post("/users", async (req, res) => {
  try {
    const validationError = validateRequestBody(req.body);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const { email, password } = req.body;
    const users = await fileRead(usersPath); // Reads the users from JSON

    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Avoid exposing sensitive user data (don't send password)
    const { password: _, ...safeUser } = user;

    res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error("Full Error:", error); // Debugging log
    res.status(500).json({ message: "Internal server error" });
  }
});



// Export the app as a serverless function
export const handler = serverless(app);
