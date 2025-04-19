const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const fs = require("fs").promises;
const app = express();

app.use(cors());
app.use(express.json());



async function parser(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
    });
}

async function fileRead(path) {
    try {
        const data = await fs.readFile(path, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        throw new Error("Error reading file");
    }
}

app.post("/api/users", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }

        const users = await fileRead("./database/users.json");

        const user = users.find(
            (user) => user.email === email && user.password === password
        );

        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Оборачиваем в serverless
module.exports.handler = serverless(app);