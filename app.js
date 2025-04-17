const http = require("node:http");
const parser = require("./utils/parser");
const { fileRead, fileWrite } = require("./utils/RW");
const cors = require("cors"); // Import CORS

// Enable CORS
const corsOptions = {
  origin: "https://archlab.vercel.app", // Allow requests only from your frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type"], // Allowed headers
};

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://archlab.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.url === "/addobj" && req.method === "POST") {
    const { name, description, price, username, password } = await parser(req);
    const cars = await fileRead("./database/users.json");
    const car = {
      id: cars.length + 1,
      name,
      description,
      price,
      username,
      password,
    };
    cars.push(car);
    fileWrite("./database/users.json", cars);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "user added successfully!" }));

    //   uerlarni login bilan paroli tekshirish uchun
  } else if (req.url === "/users" && req.method === "GET") {
    try {
      const { email, password } = await parser(req);

      if (!email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Email and password are required" }));
        return;
      }

      const users = await fileRead("./database/users.json");

      // Ensure users is parsed correctly
      const user = users.find(
        (user) => user.email === email && user.password === password
      );

      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid email or password" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ message: "User authenticated successfully", user })
      );
    } catch (error) {
      console.error("Error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Internal server error" }));
    }
  } else if (req.url === "/projec" && req.method === "DELETE") {
    const { id } = await parser(req);
    const cars = await fileRead("./database/users.json");
    const filteredCars = cars.filter((el) => el.id !== id);
    filteredCars.forEach((el) => {
      if (el.id > id) {
        el.id = 1;
      }
    });
    await fileWrite("./database/users.json", filteredCars);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "user deleted successfully!" }));
  } else if (req.url === "/projec" && req.method === "PUT") {
    const { id, name, description, price } = await parser(req);
    const cars = await fileRead("./database/users.json");
    const findCar = cars.find((el) => el.id === id);
    const editedCar = {
      id,
      name: name ? name : findCar.name,
      description: description ? description : findCar.description,
      price: price ? price : findCar.price,
    };
    cars[id - 1] = editedCar;
    await fileWrite("./database/users.json", cars);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Car details edited successfully!" }));
  }
  if (req.url === "/prise" && req.method === "GET") {
    const { at, to } = await parser(req);
    const fs = require("fs");
    fs.readFile("./database/users.json", "utf8", (err, data) => {
      if (err) {
        console.error("Faylni o'qishda xato:", err);
        return;
      }
      const items = JSON.parse(data);
      const filteredItems = items.filter(
        (item) => item.price >= at && item.price <= to
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(filteredItems));
    });
  }
  if (req.url === "/elements" && req.method === "GET") {
    const { page, take } = await parser(req);
    const cars = await fileRead("./database/users.json");
    const startIndex = (page - 1) * take;
    const paginatedItems = cars.splice(startIndex, take);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(paginatedItems));
  }
  if (req.url === "/login" && req.method === "GET") {
    // const { username, password } = req.body;
    const { username, password } = await parser(req);
    const cars = await fileRead("./database/users.json");
    const findUser = cars.find(
      (el) => el.username === username && el.password === password
    );

    if (!findUser == "") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User correct" }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Username or pasword isent correct" }));
    }
  }
});

server.listen(8888, () => {
  console.log("Server started");
});
