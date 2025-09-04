import axios from "axios";

async function getProducts() {
  try {
    const {
      data: { products },
    } = await axios.get("https://dummyjson.com/products");

    console.log("products", products);
    return products;
  } catch (error) {
    console.error(error);
  }
}

getProducts();
