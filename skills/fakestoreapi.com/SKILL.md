# Fake Store API

Fake e-commerce data for testing.

**Base URL:** `https://fakestoreapi.com`

**Auth:** None required

**Status:** ✅ Verified

## Endpoints

### GET /products
Get all products
- **Response:** Array of Product objects

### GET /products/{id}
Get single product
- **Params:** `id` (number)
- **Response:** Product object

### GET /products/categories
Get all categories
- **Response:** Array of category strings

### GET /products/category/{category}
Get products in category
- **Params:** `category` (string)
- **Response:** Array of Product objects

### GET /carts
Get all carts
- **Response:** Array of Cart objects

### GET /users
Get all users
- **Response:** Array of User objects
