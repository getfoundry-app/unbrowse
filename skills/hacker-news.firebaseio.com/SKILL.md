# Hacker News API

Official Hacker News Firebase API for stories, comments, and users.

**Base URL:** `https://hacker-news.firebaseio.com/v0`

**Auth:** None required

**Status:** ✅ Verified

## Endpoints

### GET /topstories.json
Get top story IDs
- **Response:** Array of story IDs (up to 500)

### GET /newstories.json
Get new story IDs
- **Response:** Array of story IDs (up to 500)

### GET /beststories.json
Get best story IDs
- **Response:** Array of story IDs (up to 500)

### GET /askstories.json
Get Ask HN story IDs
- **Response:** Array of story IDs

### GET /showstories.json
Get Show HN story IDs
- **Response:** Array of story IDs

### GET /jobstories.json
Get job story IDs
- **Response:** Array of story IDs

### GET /item/{id}.json
Get an item (story, comment, job, poll, or pollopt)
- **Params:** `id` (number)
- **Response:** Item object

### GET /user/{id}.json
Get a user profile
- **Params:** `id` (string - username)
- **Response:** User object

### GET /maxitem.json
Get the current largest item ID
- **Response:** Number

### GET /updates.json
Get recently changed items and profiles
- **Response:** Object with items and profiles arrays

## Types

```typescript
interface Story {
  id: number;
  type: 'story';
  by: string;
  time: number;
  title: string;
  url?: string;
  text?: string;
  score: number;
  descendants: number;
  kids?: number[];
  dead?: boolean;
  deleted?: boolean;
}

interface Comment {
  id: number;
  type: 'comment';
  by: string;
  time: number;
  text: string;
  parent: number;
  kids?: number[];
  dead?: boolean;
  deleted?: boolean;
}

interface Job {
  id: number;
  type: 'job';
  by: string;
  time: number;
  title: string;
  url?: string;
  text?: string;
  score: number;
}

interface User {
  id: string;
  created: number;
  karma: number;
  about?: string;
  submitted?: number[];
}

interface Updates {
  items: number[];
  profiles: string[];
}
```
