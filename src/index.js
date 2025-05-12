const http = require("http");
const fs = require("fs").promises;
const crypto = require("crypto");

const PORT = 3005;

const parser = async (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
};

const fileRead = async (path) => {
  const data = await fs.readFile(path, "utf-8");
  return JSON.parse(data);
};

const server = http.createServer(async (req, res) => {
  // CORS headers for all requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.url === "/api/login") {
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === "POST") {
      try {
        const { email, password } = await parser(req);

        if (!email || !password) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Email and password are required" })
          );
          return;
        }

        let users = [];
        try {
          users = await fileRead("./database/users.json");
        } catch (error) {
          if (error.code === "ENOENT") {
            console.warn(
              "Users file not found, initializing with an empty array."
            );
          } else {
            throw error;
          }
        }

        const user = users.find(
          (user) => user.email === email && user.password === password
        );

        if (!user) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Invalid email or password" }));
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ user }));
      } catch (error) {
        console.error("Error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Internal server error" }));
      }
    }
  } else if (req.url === "/api/users") {
    if (req.method === "GET") {
      try {
        const users = await fileRead("./database/users.json");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users));
      } catch (error) {
        console.error("Error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Internal server error" }));
      }
    }
  } else if (req.url === "/api/add") {
    if (req.method === "POST") {
      try {
        const { user } = await parser(req); // Extract the 'user' object

        if (
          !user ||
          !user.email ||
          !user.password ||
          !user.status ||
          !user.name ||
          !user.surname ||
          !user.phone ||
          !user.address ||
          !user.username
        ) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "All fields are required" }));
          return;
        }

        let users = [];
        try {
          users = await fileRead("./database/users.json");
        } catch (error) {
          if (error.code === "ENOENT") {
            console.warn(
              "Users file not found, initializing with an empty array."
            );
          } else {
            throw error;
          }
        }

        const userIndex = users.findIndex(
          (existingUser) => existingUser.email === user.email
        );

        if (userIndex !== -1) {
          // Update the existing user
          users[userIndex] = { ...users[userIndex], ...user }; // Merge existing user with new data
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "User updated successfully", user: users[userIndex] })
          );
        } else {
          // Add the new user with a unique ID
          const newUser = { id: crypto.randomUUID(), ...user };
          users.push(newUser);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "User added successfully", user: newUser }));
        }

        await fs.writeFile(
          "./database/users.json",
          JSON.stringify(users, null, 2),
          "utf-8"
        );
      } catch (error) {
        console.error("Error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Internal server error" }));
      }
    }
  
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
