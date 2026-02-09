# GitHub API

Access GitHub's REST API for users, repositories, issues, and more.

**Base URL:** `https://api.github.com`

**Auth:** Optional (Bearer token for higher rate limits)

**Status:** ✅ Verified

**Rate Limits:**
- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour

## Endpoints

### GET /users/{username}
Get a user by username
- **Params:** `username` (string)
- **Response:** User object

### GET /users/{username}/repos
Get public repositories for a user
- **Params:** `username` (string)
- **Query:** `sort`, `direction`, `per_page`, `page`
- **Response:** Array of Repository objects

### GET /repos/{owner}/{repo}
Get a repository by owner and name
- **Params:** `owner` (string), `repo` (string)
- **Response:** Repository object

### GET /repos/{owner}/{repo}/issues
Get issues for a repository
- **Params:** `owner` (string), `repo` (string)
- **Query:** `state` (open/closed/all), `sort`, `direction`, `per_page`, `page`
- **Response:** Array of Issue objects

### GET /repos/{owner}/{repo}/issues/{issue_number}
Get a specific issue
- **Params:** `owner` (string), `repo` (string), `issue_number` (number)
- **Response:** Issue object

### GET /repos/{owner}/{repo}/pulls
Get pull requests for a repository
- **Params:** `owner` (string), `repo` (string)
- **Query:** `state`, `sort`, `direction`, `per_page`, `page`
- **Response:** Array of Pull Request objects

### GET /repos/{owner}/{repo}/commits
Get commits for a repository
- **Params:** `owner` (string), `repo` (string)
- **Query:** `sha`, `path`, `per_page`, `page`
- **Response:** Array of Commit objects

### GET /search/repositories
Search for repositories
- **Query:** `q` (search query), `sort`, `order`, `per_page`, `page`
- **Response:** Search results with Repository objects

### GET /search/users
Search for users
- **Query:** `q` (search query), `sort`, `order`, `per_page`, `page`
- **Response:** Search results with User objects

### GET /repos/{owner}/{repo}/contents/{path}
Get repository contents (files/directories)
- **Params:** `owner` (string), `repo` (string), `path` (string)
- **Query:** `ref` (branch/tag/commit)
- **Response:** Content object or array

### GET /repos/{owner}/{repo}/readme
Get repository README
- **Params:** `owner` (string), `repo` (string)
- **Response:** Content object with README data

## Types

```typescript
interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  repos_url: string;
  type: string;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at?: string;
}

interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: User;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics?: string[];
}

interface Issue {
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: User;
  state: 'open' | 'closed';
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string;
  labels: Label[];
}

interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string | null;
}

interface Commit {
  sha: string;
  node_id: string;
  commit: {
    author: GitUser;
    committer: GitUser;
    message: string;
    tree: { sha: string; url: string };
  };
  author: User | null;
  committer: User | null;
  parents: { sha: string; url: string }[];
}

interface GitUser {
  name: string;
  email: string;
  date: string;
}
```

## Authentication

Include your GitHub token in the Authorization header:

```
Authorization: Bearer YOUR_GITHUB_TOKEN
```
