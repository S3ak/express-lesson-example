// Import the Express library using require
import express from "express";
import aboutHTMLTemplate from "./views/about.js";
import { faker } from "@faker-js/faker";
import { createProducts } from "./utils/mocks.js";

const PORT = 3000;

// Create an instance of an Express application
const app = express();

const indexHTMLTemplate = `
  <header>
    <h1>Welcome to my server</h1>
    <nav>
      <div>
        <a href="/">Home</a>
      </div>
      <div>
        <a href="/about">About</a>
      </div>
    </nav>
  </header>
`;

const requestLogger = (req, res, next) => {
  console.warn(`Got incoming request: ${req.method} for ${req.url}`);

  // Pass control to the next middleware function
  next();
};

const authGuard = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (accessToken === "12345") {
    next();
  } else {
    res.status(401).json({ error: "Not a valid access token" });
  }
};

// Use the middleware for all incoming requests
app.use(requestLogger, express.json());

// Define a route for GET requests to the root URL ('/')
app.get("/", (req, res) => {
  // Use the send() method on the response object to send back a string
  res.send(indexHTMLTemplate);
});

// Define a route for GET requests to the root URL ('/')
app.get("/about", (req, res) => {
  // We manually set the header
  res.set("Content-Type", "text/html");
  // Use the send() method on the response object to send back a string
  res.send(Buffer.from(aboutHTMLTemplate));
});

app.get("/api/greeting", (req, res) => {
  const data = {
    message: "Hello from the API!",
    timestamp: new Date(),
  };

  // Send the 'data' object as a JSON response
  res.json(data);
});

// This is our hardcoded data, acting as a mini-database for now.
const games = [
  { id: 1, name: "The Incredible Machine", year: 1993 },
  { id: 2, name: "Lemmings", year: 1991 },
  { id: 3, name: "Day of the Tentacle", year: 1993 },
];

// Endpoint to get all games
app.get("/api/games", authGuard, (req, res) => {
  res.json(games);
});

// Endpoint to create a new game
app.post("/api/games", (req, res) => {
  const body = req.body;

  console.log("body >>>>", body);

  games.push({
    ...body,
    uuid: faker.string.uuid(),
    id: games.length + 1,
    year: 2025,
  });

  res.status(201).json(games);
});

app.get("/api/games/:id", (req, res) => {
  let { id } = req.params;
  // Get the ID from the request parameters. Note: it will be a string.
  id = parseInt(id);

  // Find the game in our 'database' with the matching ID
  const foundGame = games.find((game) => game.id === id);

  // If no game was found, send a 404 status and an error message
  if (!foundGame) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json(foundGame);
});

app.get("/api/dummy-products", async (req, res) => {
  let products = [];

  try {
    // We can make request from express to external resources
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();
    console.info("data >>>", data);
    products = data.products;
  } catch (error) {
    return res.status(404).json({ error: error?.message });
  }

  console.log("products >>>>", products);

  // If no game was found, send a 404 status and an error message
  if (products.length === 0) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json(products);
});

app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  let product = {
    id: faker.string.uuid(),
    title: faker.commerce.product(),
    price: faker.commerce.price(),
    description: faker.commerce.productDescription(),
    image: faker.image.url(),
  };

  // If no game was found, send a 404 status and an error message
  if (!product) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json(product);
});

app.get("/api/products", async (req, res) => {
  let products = createProducts();

  // If no game was found, send a 404 status and an error message
  if (!products.length === 0) {
    return res.status(404).json({ error: "No Products avalible" });
  }

  res.json(products);
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running and listening on http://localhost:${PORT}`);
});
