// Import the Express library using require
import express from "express";
import { faker } from "@faker-js/faker";
import { createProducts } from "./utils/mocks.js";
import { readFileSync, writeFile } from "node:fs";
import cors from "cors";

const PORT = 3000;
let games = [];
let htmlFilebuffer;

// Create an instance of an Express application
const app = express();
const DATAFILEPATH = "./storage/games.json";

// Load initial data from files when the server starts
try {
  // --- Load JSON Data FIles ---
  // We use the synchronous read here because it's a one-time startup task.

  const buffer = readFileSync(new URL(DATAFILEPATH, import.meta.url));

  games = JSON.parse(buffer);

  // --- Load HTML FIles ---

  const ABOUTHTMLFILEPATH = "./public/about.html";

  htmlFilebuffer = readFileSync(new URL(ABOUTHTMLFILEPATH, import.meta.url));
} catch (error) {
  console.error("Error reading data file on startup:", error);
  // If the file doesn't exist or is invalid, start with an empty array
  games = [];
}

// Helper function to write data to the file
const saveGamesData = async () => {
  try {
    // Use JSON.stringify to convert the array to a string, with nice formatting
    const dataString = JSON.stringify(games, null, 2);
    await writeFile(DATAFILEPATH, dataString);
  } catch (error) {
    console.error("Error saving data to file:", error);
  }
};

const requestLoggerMiddleWare = (req, _res, next) => {
  console.warn(`Got incoming request: ${req.method} for ${req.url}`);

  // Pass control to the next middleware function
  next();
};

const authGuardMiddleWare = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (accessToken === "12345") {
    next();
  } else {
    res.status(401).json({ error: "Not a valid access token" });
  }
};

// Use the middleware for all incoming requests
app.use(cors(), requestLoggerMiddleWare, express.json());

// Define a route for GET requests to the root URL ('/')
app.get("/", (_req, res) => {
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

  // Use the send() method on the response object to send back a string
  res.send(indexHTMLTemplate);
});

// Define a route for GET requests to the root URL ('/')
app.get("/about", (_req, res) => {
  // We manually set the header
  res.set("Content-Type", "text/html");
  // Use the send() method on the response object to send back a string
  res.send(Buffer.from(htmlFilebuffer));
});

app.get("/api/greeting", (_req, res) => {
  const data = {
    message: "Hello from the API!",
    timestamp: new Date(),
  };

  // Send the 'data' object as a JSON response
  res.json(data);
});

// Endpoint to get all games
app.get("/api/games", (_req, res) => {
  res.json(games);
});

// Endpoint to create a new game
app.post("/api/games", async (req, res) => {
  const body = req.body;

  console.log("body >>>>", body);

  // This will add to the games list temporarly until the server is restarted. Usually inserting an item into permant database will be a async function and should be wrapped in a try catch.
  games.push({
    ...body,
    uuid: faker.string.uuid(),
    id: games.length + 1,
    year: 2025,
  });

  // Asynchronously save the updated array to the file
  await saveGamesData();

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

// This route gets its data from an external datasource.
app.get("/api/dummy-products", async (_req, res) => {
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
    return res.status(404).json({ error: "No products found" });
  }

  res.json(products);
});

app.get("/api/products/:id", async (_req, res) => {
  // We should search our database for this specific products
  // const { id } = req.params;
  // products.find(product => product.id === id);

  // Here we generate a random product on the fly.
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

// This routed is protected. The client must send in a accesstoken to recieve the products data
app.get("/api/products", authGuardMiddleWare, (req, res) => {
  // Using a helper function to generate a list of random products.
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
