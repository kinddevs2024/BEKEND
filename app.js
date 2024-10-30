const http = require("node:http");
const parser = require("./utils/parser");
const { fileRead, fileWrite } = require("./utils/RW");

const server = http.createServer(async (req, res) => {
    if (req.url === "/addobj" && req.method === "POST") {
        const { name, description, price, username, password } = await parser(req);
        const cars = await fileRead("./database/users.json");
        const car = { id: cars.length + 1, name, description, price, username, password };
        cars.push(car);
        fileWrite("./database/users.json", cars);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "user added successfully!" }));
    } else if (req.url === "/projec" && req.method === "GET") {
        const cars = await fileRead("./database/users.json");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(cars));
    } else if (req.url === "/projec" && req.method === "DELETE") {
        const { id } = await parser(req);
        const cars = await fileRead("./database/users.json");
        const filteredCars = cars.filter((el) => el.id !== id);
        filteredCars.forEach((el) => { if (el.id > id) { el.id = 1; } });
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
        const fs = require('fs');
        fs.readFile('./database/users.json', 'utf8', (err, data) => {
            if (err) {
                console.error("Faylni o'qishda xato:", err);
                return;
            }
            const items = JSON.parse(data);
            const filteredItems = items.filter(item => item.price >= at && item.price <= to);
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
        const findUser = cars.find((el) => el.username === username && el.password === password);

        if (!findUser == "") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "User correct" }));
        } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Username or pasword isent correct" }));
        }
    }
});

server.listen(7777, () => { console.log("Server started"); });