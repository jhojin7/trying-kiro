# Universal Pocket Local API Server

The local API server enables Raycast integration and external tool communication with Universal Pocket. It runs on `localhost:3001` and provides REST endpoints plus WebSocket support for real-time updates.

## Getting Started

### Start the Server

```bash
# Development mode (auto-restart on changes)
npm run server:dev

# Production build and start
npm run server:build
npm run server:start

# Run both web app and server together
npm run dev:full
```

### Server Status
- **URL**: `http://localhost:3001`
- **Health Check**: `GET /api/health`
- **WebSocket**: `ws://localhost:3001/ws`

## Core Endpoints

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-19T07:32:33.822Z",
  "connections": 0
}
```

### Save Content
```http
POST /api/save
Content-Type: application/json

{
  "content": "Text content or note",
  "url": "https://example.com",
  "title": "Optional title",
  "source": "raycast"
}
```

**Response:**
```json
{
  "success": true,
  "id": "content_1752910362171_6nsdrludl",
  "message": "Content saved successfully"
}
```

**Requirements:**
- Either `content` or `url` must be provided
- `title` is optional (auto-generated if not provided)
- `source` defaults to "raycast"

### Get All Content
```http
GET /api/content
```

**Response:**
```json
[
  {
    "id": "content_1752910362171_6nsdrludl",
    "type": "note",
    "title": "API Test Note",
    "content": "Test note from API",
    "url": null,
    "thumbnail": "",
    "metadata": {
      "source": "raycast",
      "savedAt": "2025-07-19T07:32:42.171Z"
    },
    "tags": ["raycast", "note"],
    "createdAt": "2025-07-19T07:32:42.171Z",
    "syncStatus": "local"
  }
]
```

### Get Specific Content
```http
GET /api/content/:id
```

### Delete Content
```http
DELETE /api/content/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

### Search Content
```http
GET /api/search?q=search-term
```

### Get Content by Type
```http
GET /api/content/type/:type
```

**Valid types:** `article`, `video`, `social`, `note`, `link`, `image`

## Raycast-Specific Endpoints

### Quick Note
```http
POST /api/raycast/quick-note
Content-Type: application/json

{
  "note": "Quick note content",
  "title": "Optional title"
}
```

### Save Clipboard
```http
POST /api/raycast/save-clipboard
Content-Type: application/json

{
  "content": "Clipboard content"
}
```

## WebSocket Real-Time Updates

Connect to `ws://localhost:3001/ws` to receive real-time updates.

### Message Types

**Content Added:**
```json
{
  "type": "content_added",
  "data": {
    "id": "content_123",
    "title": "New Content",
    ...
  }
}
```

**Content Deleted:**
```json
{
  "type": "content_deleted",
  "data": {
    "id": "content_123"
  }
}
```

## Content Type Detection

The server automatically detects content types based on URL patterns:

- **Video**: YouTube, Vimeo, Twitch URLs → `video`
- **Social**: Twitter/X, Instagram, TikTok, LinkedIn → `social`
- **Article**: Other URLs → `article`
- **Note**: Text without URL → `note`
- **Link**: Fallback for other URLs → `link`

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing required fields)
- `404` - Not Found
- `500` - Internal Server Error

## Example Usage

### Save a Quick Note
```bash
curl -X POST http://localhost:3001/api/raycast/quick-note \
  -H "Content-Type: application/json" \
  -d '{"note": "Remember to review the API docs"}'
```

### Save a URL
```bash
curl -X POST http://localhost:3001/api/save \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/anthropics/claude-code", "title": "Claude Code"}'
```

### Search Content
```bash
curl "http://localhost:3001/api/search?q=github"
```

### Get All Notes
```bash
curl "http://localhost:3001/api/content/type/note"
```

## Architecture Notes

### In-Memory Storage
Currently uses in-memory storage for development. In production, this should be connected to the same IndexedDB storage as the web app.

### CORS Configuration
CORS is enabled for:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:5174` (Vite dev server alternate port)

### Graceful Shutdown
The server handles `SIGTERM` and `SIGINT` signals for graceful shutdown:
- Closes all WebSocket connections
- Stops the HTTP server
- Exits cleanly

### Error Recovery
- Automatic removal of disconnected WebSocket clients
- Comprehensive error handling and logging
- Validates input data and provides meaningful error messages

## Security Considerations

### Local Only
This server is designed to run locally only. It should NOT be exposed to the internet.

### No Authentication
Currently no authentication is implemented, as it's designed for local development and Raycast integration.

### Input Validation
Basic input validation is performed, but additional sanitization may be needed for production use.

## Integration with Web App

The API server can be used alongside the web app for a complete development experience:

```bash
# Run both together
npm run dev:full

# Or separately
npm run dev        # Web app on :5174
npm run server:dev # API server on :3001
```

The web app can connect to the WebSocket endpoint to receive real-time updates when content is saved via the API.