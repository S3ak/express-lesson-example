import { faker } from "@faker-js/faker";

export function createProduct() {
  const id = faker.number.int();
  const title = faker.commerce.product();
  const price = faker.commerce.price();
  const description = faker.commerce.productDescription();

  return {
    _id: faker.string.uuid(),
    image: faker.image.url(),
    title,
    price,
    description,
  };
}

export function createProducts(count = 10) {
  return Array.from({ length: count }, () => createProduct());
}

const mockUsers = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.firstName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement(["admin", "user"]),
  password: faker.internet.password(), // Remember to hash this before inserting into the database
}));

const mockCustomers = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.firstName(),
  email: faker.internet.email(),
  password: faker.internet.password(), // Remember to hash this before inserting into the database
  phone: faker.phone.number(), // Remember to hash this before inserting into the database
}));

const mockProducts = createProducts(20);
