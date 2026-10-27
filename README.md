# Image Search Abstraction Layer

A freeCodeCamp API project built with Node.js and Express. Images come from the
[Wikimedia Commons API](https://commons.wikimedia.org/w/api.php), which is free and needs no API key.

## Endpoints

### `GET /query/:search?page=N`

Returns up to 10 images matching the search string. `page` is optional and defaults to 1.

```
GET /query/lolcats%20funny?page=2
```

```json
[
  {
    "url": "https://upload.wikimedia.org/wikipedia/commons/...jpg",
    "snippet": "Description of the image",
    "thumbnail": "https://thumb.wikimedia.org/...330px-....jpg",
    "context": "https://commons.wikimedia.org/wiki/File:...jpg"
  }
]
```

### `GET /recent`

Returns the 10 most recent search strings, newest first.

```json
[{ "term": "lolcats funny", "when": "2026-10-27T09:25:54.371Z" }]
```

## Run locally

```bash
npm install
npm start          # http://localhost:3000
```

Optional environment variables:

| Variable      | Default             | Purpose                                     |
| ------------- | ------------------- | ------------------------------------------- |
| `PORT`        | `3000`              | Port to listen on                           |
| `RECENT_FILE` | `data/recent.json`  | Where recent searches are saved             |
| `USER_AGENT`  | built-in string     | User-Agent sent to Wikimedia (they ask for one that identifies the app) |

## Deploy (Render, free tier)

1. Push this folder to a GitHub repository.
2. On [render.com](https://render.com), create a **Web Service** from that repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Submit the `https://<your-app>.onrender.com` URL to freeCodeCamp.

Free hosts usually have temporary disks, so the recent-search list resets when the app restarts.
