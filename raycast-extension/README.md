# Universal Pocket Raycast Extension

Ultra-fast commands for saving content to Universal Pocket directly from Raycast.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Universal Pocket API Server
```bash
# From the main project directory
npm run server:dev
```
The API server must be running on `localhost:3001` for the extension to work.

### 3. Build Extension
```bash
npm run build
```

### 4. Install in Raycast
```bash
npm run dev
```
This opens the extension in Raycast development mode.

## Commands

### 🌐 Save Current URL
**Command:** `Save Current URL`
- **Mode:** No-view (instant execution)
- **Function:** Gets the current browser tab URL and title, saves to Universal Pocket
- **Supported Browsers:** Chrome, Safari, Arc
- **Optional:** Captures selected text if available

### 📝 Quick Note
**Command:** `Quick Note`
- **Mode:** Form view
- **Function:** Save a quick note with optional title
- **Fields:**
  - Note Content (required) - Main note text
  - Title (optional) - Custom title for the note

### 📋 Save Clipboard
**Command:** `Save Clipboard`
- **Mode:** No-view (instant execution)
- **Function:** Saves current clipboard content to Universal Pocket
- **Requirements:** Clipboard must contain text

## How It Works

1. **API Integration:** All commands communicate with the Universal Pocket API server running on `localhost:3001`
2. **Content Detection:** The server automatically detects content type (note, article, video, etc.) based on URL patterns
3. **Offline Queue:** Content is saved locally and synced when the web app is opened
4. **Real-time Updates:** Uses WebSocket connections for real-time sync between Raycast and web app

## Usage Tips

### Browser Tab Saving
- Works with Chrome, Safari, and Arc browsers
- Make sure the browser is the active application
- Selected text will be captured automatically if available
- URLs are automatically classified (video, article, social media, etc.)

### Quick Notes
- Perfect for saving ideas, todos, or quick thoughts
- Title is optional - will auto-generate if not provided
- Notes are tagged automatically for easy searching

### Clipboard Saving
- Great for saving text from any application
- Automatically detects if clipboard contains a URL
- Works with any text content

## Development

### File Structure
```
src/
├── save-url.tsx      # Browser tab URL saving
├── quick-note.tsx    # Note creation form
└── save-clipboard.tsx # Clipboard content saving
```

### API Endpoints Used
- `POST /api/save` - Save URL with title and optional content
- `POST /api/raycast/quick-note` - Save note with optional title
- `POST /api/raycast/save-clipboard` - Save clipboard content

### Build Commands
```bash
npm run build     # Build extension for production
npm run dev       # Development mode with hot reload
npm run lint      # ESLint code checking
npm run fix-lint  # Auto-fix lint issues
```

## Troubleshooting

### Extension Not Working
1. Ensure Universal Pocket API server is running: `npm run server:dev`
2. Check server is accessible: `curl http://localhost:3001/api/health`
3. Verify Raycast has necessary permissions (accessibility for browser automation)

### Browser Tab Not Detected
1. Make sure Chrome, Safari, or Arc is the active application
2. Grant Raycast accessibility permissions in System Preferences
3. Check that the browser has at least one open tab

### Clipboard Empty Error
1. Copy some text to clipboard before running the command
2. Ensure clipboard contains text (not just images or files)

## Integration with Universal Pocket

The extension works seamlessly with the Universal Pocket web app:

1. **Start API Server:** `npm run server:dev` (from main project)
2. **Open Web App:** `npm run dev` (from main project)
3. **Use Raycast Commands:** Content saved via Raycast appears in web app instantly
4. **WebSocket Sync:** Real-time updates between Raycast and web app

Content saved through Raycast is tagged with `raycast` for easy identification and filtering.