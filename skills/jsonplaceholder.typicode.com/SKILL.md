# JSONPlaceholder API

Free fake REST API for testing and prototyping.

**Base URL:** `https://jsonplaceholder.typicode.com`

**Auth:** None required

**Status:** ✅ Verified

## Endpoints

### GET /posts
Get all posts
- **Response:** Array of Post objects

### GET /posts/{id}
Get a single post by ID
- **Params:** `id` (number)
- **Response:** Post object

### GET /users
Get all users
- **Response:** Array of User objects

### GET /users/{id}
Get a single user by ID
- **Params:** `id` (number)
- **Response:** User object

### GET /comments
Get all comments
- **Response:** Array of Comment objects

### GET /comments?postId={postId}
Get comments for a specific post
- **Query:** `postId` (number)
- **Response:** Array of Comment objects

### GET /albums
Get all albums
- **Response:** Array of Album objects

### GET /albums/{id}
Get a single album by ID
- **Params:** `id` (number)
- **Response:** Album object

### GET /todos
Get all todos
- **Response:** Array of Todo objects

### GET /todos/{id}
Get a single todo by ID
- **Params:** `id` (number)
- **Response:** Todo object

### GET /photos
Get all photos
- **Response:** Array of Photo objects

### GET /photos/{id}
Get a single photo by ID
- **Params:** `id` (number)
- **Response:** Photo object

### POST /posts
Create a new post
- **Body:** Post data
- **Response:** Created post with ID

### PUT /posts/{id}
Update a post
- **Params:** `id` (number)
- **Body:** Post data
- **Response:** Updated post

### PATCH /posts/{id}
Partially update a post
- **Params:** `id` (number)
- **Body:** Partial post data
- **Response:** Updated post

### DELETE /posts/{id}
Delete a post
- **Params:** `id` (number)
- **Response:** Empty object

## Types

```typescript
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: { lat: string; lng: string };
}

interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

interface Album {
  userId: number;
  id: number;
  title: string;
}

interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}
```
