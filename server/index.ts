import express from 'express'
import cors from 'cors'
import { WebSocket, WebSocketServer } from 'ws'
import { createServer } from 'http'
import { contentBridge } from './services/content-bridge'
import { SaveRequest, ContentItem } from '../src/types'

const app = express()
const PORT = 3001

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite dev servers
  credentials: true
}))
app.use(express.json())

// HTTP Server
const server = createServer(app)

// WebSocket Server for real-time updates
const wss = new WebSocketServer({ server })

// Store active WebSocket connections
const connections = new Set<WebSocket>()

wss.on('connection', (ws) => {
  connections.add(ws)
  console.log('WebSocket client connected')
  
  ws.on('close', () => {
    connections.delete(ws)
    console.log('WebSocket client disconnected')
  })
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
    connections.delete(ws)
  })
})

// Broadcast to all connected WebSocket clients
function broadcast(message: any) {
  const data = JSON.stringify(message)
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  })
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connections: connections.size
  })
})

// Save content endpoint - optimized for speed
app.post('/api/save', async (req, res) => {
  try {
    const saveRequest: SaveRequest = {
      ...req.body,
      source: req.body.source || 'raycast'
    }

    // Validate required fields
    if (!saveRequest.content && !saveRequest.url) {
      return res.status(400).json({
        error: 'Either content or url is required'
      })
    }

    // Save content 
    const savedContent = await contentBridge.saveContent(saveRequest)

    // Immediately respond to Raycast
    res.json({
      success: true,
      id: savedContent.id,
      message: 'Content saved successfully'
    })

    // Broadcast to web app clients
    broadcast({
      type: 'content_added',
      data: savedContent
    })

  } catch (error) {
    console.error('Error saving content:', error)
    res.status(500).json({
      error: 'Failed to save content',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get all content
app.get('/api/content', async (req, res) => {
  try {
    const content = await contentBridge.getAllContent()
    res.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    res.status(500).json({
      error: 'Failed to fetch content',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get specific content item
app.get('/api/content/:id', async (req, res) => {
  try {
    const content = await contentBridge.getContent(req.params.id)
    if (!content) {
      return res.status(404).json({ error: 'Content not found' })
    }
    res.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    res.status(500).json({
      error: 'Failed to fetch content',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Delete content
app.delete('/api/content/:id', async (req, res) => {
  try {
    await contentBridge.deleteContent(req.params.id)
    
    res.json({
      success: true,
      message: 'Content deleted successfully'
    })

    // Broadcast deletion to web app clients
    broadcast({
      type: 'content_deleted',
      data: { id: req.params.id }
    })

  } catch (error) {
    console.error('Error deleting content:', error)
    res.status(500).json({
      error: 'Failed to delete content',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Search content
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q as string
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const results = await contentBridge.searchContent(query)
    res.json(results)
  } catch (error) {
    console.error('Error searching content:', error)
    res.status(500).json({
      error: 'Failed to search content',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get content by type
app.get('/api/content/type/:type', async (req, res) => {
  try {
    const type = req.params.type as any // ContentType
    const content = await contentBridge.getContentByType(type)
    res.json(content)
  } catch (error) {
    console.error('Error fetching content by type:', error)
    res.status(500).json({
      error: 'Failed to fetch content',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Raycast-specific endpoints for convenience

// Quick save clipboard content
app.post('/api/raycast/save-clipboard', async (req, res) => {
  try {
    const { content } = req.body
    
    if (!content) {
      return res.status(400).json({ error: 'Clipboard content is required' })
    }

    const saveRequest: SaveRequest = {
      content,
      source: 'raycast',
      title: content.length > 50 ? `${content.substring(0, 50)}...` : content
    }

    const savedContent = await contentBridge.saveContent(saveRequest)

    res.json({
      success: true,
      id: savedContent.id,
      message: 'Clipboard content saved'
    })

    broadcast({
      type: 'content_added',
      data: savedContent
    })

  } catch (error) {
    console.error('Error saving clipboard:', error)
    res.status(500).json({
      error: 'Failed to save clipboard content',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Quick note endpoint
app.post('/api/raycast/quick-note', async (req, res) => {
  try {
    const { note, title } = req.body
    
    if (!note) {
      return res.status(400).json({ error: 'Note content is required' })
    }

    const saveRequest: SaveRequest = {
      content: note,
      title: title || (note.length > 50 ? `${note.substring(0, 50)}...` : note),
      source: 'raycast'
    }

    const savedContent = await contentBridge.saveContent(saveRequest)

    res.json({
      success: true,
      id: savedContent.id,
      message: 'Note saved successfully'
    })

    broadcast({
      type: 'content_added',
      data: savedContent
    })

  } catch (error) {
    console.error('Error saving note:', error)
    res.status(500).json({
      error: 'Failed to save note',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  })
})

// Graceful shutdown
function gracefulShutdown() {
  console.log('Shutting down server...')
  
  // Close WebSocket connections
  connections.forEach((ws) => {
    ws.close()
  })
  
  // Close HTTP server
  server.close(() => {
    console.log('Server shut down successfully')
    process.exit(0)
  })
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start server
server.listen(PORT, () => {
  console.log(`Universal Pocket API server running on http://localhost:${PORT}`)
  console.log(`WebSocket server ready for connections`)
  console.log('Press Ctrl+C to stop')
})

export default app