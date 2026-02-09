# Hacker News Firebase Internal API

## Overview
**Domain:** hacker-news.firebaseio.com  
**Type:** INTERNAL API (Reverse Engineered)  
**Protocol:** REST/HTTP  
**Backend:** Firebase Realtime Database  
**Purpose:** Access Hacker News stories, comments, and user data

**✅ NOTE:** This API is actually semi-official. While not heavily marketed, it's the official backend API that powers HN. However, it's still "internal" in the sense that it's not formally documented as a public API.

## Discovery Method
- Well-known in the HN community
- Powers the official HN frontend
- Reverse engineered by observing frontend calls

## Base URL
```
https://hacker-news.firebaseio.com/v0
```

## Authentication
- **None required**
- Fully public, read-only API
- No rate limiting (community respect expected)

## Discovered Endpoints

### 1. Get Top Stories

#### Endpoint
```
GET /v0/topstories.json
```

#### Description
Returns array of item IDs for the current top stories (up to 500).

#### Example Request
```bash
curl "https://hacker-news.firebaseio.com/v0/topstories.json"
```

#### Response Format
```json
[46943568, 46944555, 46938511, 46930961, ...]
```

Returns array of up to 500 story IDs.

### 2. Get New Stories

#### Endpoint
```
GET /v0/newstories.json
```

#### Description
Returns array of item IDs for new stories (up to 500).

### 3. Get Best Stories

#### Endpoint
```
GET /v0/beststories.json
```

#### Description
Returns array of item IDs for best stories (up to 200).

### 4. Get Ask HN Stories

#### Endpoint
```
GET /v0/askstories.json
```

#### Description
Returns array of item IDs for Ask HN stories.

### 5. Get Show HN Stories

#### Endpoint
```
GET /v0/showstories.json
```

#### Description
Returns array of item IDs for Show HN stories.

### 6. Get Job Stories

#### Endpoint
```
GET /v0/jobstories.json
```

#### Description
Returns array of item IDs for job postings.

### 7. Get Item Details

#### Endpoint
```
GET /v0/item/{id}.json
```

#### Description
Get full details for a specific item (story, comment, poll, etc.).

#### Example Request
```bash
curl "https://hacker-news.firebaseio.com/v0/item/42663924.json"
```

#### Story Response Format
```json
{
  "by": "pg",
  "descendants": 71,
  "id": 8863,
  "kids": [8952, 9224, 8917, ...],
  "score": 111,
  "time": 1175714200,
  "title": "My YC app: Dropbox - Throw away your USB drive",
  "type": "story",
  "url": "http://www.getdropbox.com/u/2/screencast.html"
}
```

#### Comment Response Format
```json
{
  "by": "d3Xt3r",
  "id": 42663924,
  "parent": 42647824,
  "text": "Agreed, in fact this is...",
  "time": 1736579112,
  "type": "comment",
  "kids": [42664123, 42664156]
}
```

#### Poll Response Format
```json
{
  "by": "author",
  "id": 126809,
  "descendants": 54,
  "kids": [126822, 126823, ...],
  "parts": [126810, 126811, 126812],
  "score": 46,
  "text": "Poll text...",
  "time": 1204403652,
  "title": "Poll: What would happen...",
  "type": "poll"
}
```

### 8. Get User Details

#### Endpoint
```
GET /v0/user/{username}.json
```

#### Description
Get information about a specific user.

#### Example Request
```bash
curl "https://hacker-news.firebaseio.com/v0/user/pg.json"
```

#### Response Format
```json
{
  "about": "Bug fixer.",
  "created": 1160418092,
  "id": "pg",
  "karma": 155111,
  "submitted": [8265435, 8168423, ...]
}
```

### 9. Get Max Item ID

#### Endpoint
```
GET /v0/maxitem.json
```

#### Description
Get the current largest item ID (useful for polling for new items).

#### Response Format
```json
46945123
```

### 10. Get Updates

#### Endpoint
```
GET /v0/updates.json
```

#### Description
Get recently changed items and profiles.

#### Response Format
```json
{
  "items": [8423305, 8420805, ...],
  "profiles": ["thefox", "mdda", ...]
}
```

## Item Types

Items can be one of these types:
- `story` - A story (post)
- `comment` - A comment
- `poll` - A poll
- `pollopt` - A poll option
- `job` - A job posting

## Field Descriptions

### Story/Comment Fields
| Field | Type | Description |
|-------|------|-------------|
| id | number | Item's unique ID |
| by | string | Username of author |
| time | number | Unix timestamp |
| text | string | Comment text (HTML) |
| kids | array | IDs of child comments |
| parent | number | Parent comment ID |
| score | number | Story score/points |
| title | string | Story title |
| url | string | Story URL |
| descendants | number | Total comment count |
| type | string | Item type |
| dead | boolean | If item is dead/deleted |
| deleted | boolean | If item is deleted |

### User Fields
| Field | Type | Description |
|-------|------|-------------|
| id | string | Username |
| created | number | Account creation timestamp |
| karma | number | User's karma |
| about | string | User's bio (HTML) |
| submitted | array | IDs of submitted items |

## Rate Limiting
- **No official rate limits**
- Community courtesy: Don't hammer the API
- Consider caching aggressively
- Poll for updates at reasonable intervals

## Integration Tips

### TypeScript Example
```typescript
interface HNItem {
  id: number;
  by?: string;
  time: number;
  kids?: number[];
  type: 'story' | 'comment' | 'poll' | 'job';
  title?: string;
  text?: string;
  url?: string;
  score?: number;
  descendants?: number;
}

async function getHNItem(id: number): Promise<HNItem> {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${id}.json`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch item ${id}`);
  }
  return response.json();
}

async function getTopStories(limit: number = 30): Promise<HNItem[]> {
  // Get top story IDs
  const response = await fetch(
    'https://hacker-news.firebaseio.com/v0/topstories.json'
  );
  const ids: number[] = await response.json();
  
  // Fetch first N stories
  const stories = await Promise.all(
    ids.slice(0, limit).map(id => getHNItem(id))
  );
  
  return stories;
}
```

### Python Example
```python
import requests
from typing import Dict, List, Any

class HackerNewsAPI:
    BASE_URL = "https://hacker-news.firebaseio.com/v0"
    
    def get_item(self, item_id: int) -> Dict[str, Any]:
        """Get details for a specific item."""
        url = f"{self.BASE_URL}/item/{item_id}.json"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    
    def get_top_stories(self, limit: int = 30) -> List[Dict[str, Any]]:
        """Get top stories."""
        # Get story IDs
        url = f"{self.BASE_URL}/topstories.json"
        response = requests.get(url)
        ids = response.json()
        
        # Fetch story details
        stories = []
        for item_id in ids[:limit]:
            try:
                story = self.get_item(item_id)
                if story:  # Filter out None/deleted
                    stories.append(story)
            except Exception as e:
                print(f"Error fetching item {item_id}: {e}")
                continue
        
        return stories
    
    def get_user(self, username: str) -> Dict[str, Any]:
        """Get user details."""
        url = f"{self.BASE_URL}/user/{username}.json"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()

# Usage
hn = HackerNewsAPI()
top_stories = hn.get_top_stories(10)
for story in top_stories:
    print(f"{story['title']} (Score: {story.get('score', 0)})")
```

## Use Cases

1. **HN Reader Apps:** Build custom HN clients
2. **Analytics:** Track story trends and popularity
3. **Notifications:** Monitor for new stories/comments
4. **Archival:** Archive HN content
5. **Search:** Build custom search engines
6. **User Analysis:** Study user behavior patterns

## Best Practices

### Caching Strategy
```typescript
// Cache stories for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, { data: any; timestamp: number }>();

async function getCachedHNData(key: string, fetcher: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### Handling Deleted Items
```typescript
async function getItemSafe(id: number): Promise<HNItem | null> {
  try {
    const item = await getHNItem(id);
    // Filter out deleted/dead items
    if (item.deleted || item.dead) {
      return null;
    }
    return item;
  } catch (error) {
    console.error(`Failed to fetch item ${id}:`, error);
    return null;
  }
}
```

### Polling for New Stories
```typescript
let lastMaxId = 0;

async function pollForNewStories(): Promise<number[]> {
  const currentMaxId = await fetch(
    'https://hacker-news.firebaseio.com/v0/maxitem.json'
  ).then(r => r.json());
  
  if (currentMaxId > lastMaxId) {
    const newIds = [];
    for (let id = lastMaxId + 1; id <= currentMaxId; id++) {
      newIds.push(id);
    }
    lastMaxId = currentMaxId;
    return newIds;
  }
  
  return [];
}
```

## Known Issues

1. **Deleted Items:** Return `null` or have `deleted: true`
2. **Missing Fields:** Not all fields present on all items
3. **HTML in Text:** `text` and `about` fields contain HTML
4. **No Search:** No built-in search endpoint
5. **No Pagination:** Story lists return all IDs at once

## HTML Sanitization

Story text and user bios contain HTML. Always sanitize before rendering:

```typescript
import DOMPurify from 'dompurify';

function sanitizeHNText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'a', 'i', 'pre', 'code'],
    ALLOWED_ATTR: ['href']
  });
}
```

## Alternatives

If this API becomes unavailable:
1. **Algolia HN Search API:** `http://hn.algolia.com/api`
2. **Official Website:** Scrape from `https://news.ycombinator.com`
3. **HN RSS Feeds:** Available for stories

## Community Resources

- **HN API Docs (unofficial):** https://github.com/HackerNews/API
- **Algolia HN Search:** https://hn.algolia.com/
- **HN Reader Apps:** Many open-source examples

## Changelog

- **2026-02-09:** Documented as reverse-engineered API
- Based on long-standing community knowledge
- Endpoints verified through actual calls

## Legal & Ethical

**Status: COMMUNITY-APPROVED**
- This API is the official backend for HN
- Community has used it for years
- Not explicitly documented but implicitly approved
- Y Combinator has not objected to its use
- Still recommended to use respectfully

## References

- **Hacker News:** https://news.ycombinator.com/
- **GitHub API Docs:** https://github.com/HackerNews/API
- **Algolia Search:** https://hn.algolia.com/api

---

**Status:** ✅ Community-Approved  
**Stability:** Very High  
**Support:** Community  
**Last Verified:** February 9, 2026
