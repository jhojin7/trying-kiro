# Progressive Web App (PWA) Features

Universal Pocket is built as a Progressive Web App, providing native app-like experiences across all platforms.

## PWA Configuration

### Manifest Configuration

The PWA manifest is configured in `vite.config.ts`:

```typescript
manifest: {
  name: 'Universal Pocket',
  short_name: 'Pocket',
  description: 'Save and organize content from anywhere',
  start_url: '/',
  theme_color: '#646cff',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait-primary',
  categories: ['productivity', 'utilities']
}
```

### Service Worker

Powered by Workbox with advanced caching strategies:

```typescript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    }
  ]
}
```

## Core PWA Features

### 1. Installability

The app can be installed on any device:

- **Desktop**: Chrome, Edge, Safari
- **Mobile**: iOS Safari, Android Chrome
- **Installation prompt** appears automatically when criteria are met

#### Installation Criteria
- HTTPS served (or localhost)
- Valid web app manifest
- Service worker registered
- User engagement signals

### 2. Offline Functionality

Complete offline support through:

- **Service Worker** caches all static assets
- **IndexedDB** stores content data locally
- **Background Sync** processes queued operations when online
- **Offline indicators** show connection status

### 3. Web Share API Integration

Native sharing capabilities:

```typescript
// Share Target - Receive shared content
share_target: {
  action: '/save',
  method: 'POST',
  enctype: 'multipart/form-data',
  params: {
    title: 'title',
    text: 'text',
    url: 'url',
    files: [
      {
        name: 'files',
        accept: ['image/*', 'video/*', 'text/*', 'application/pdf']
      }
    ]
  }
}
```

### 4. App Shortcuts

Quick actions from the home screen:

```typescript
shortcuts: [
  {
    name: 'Quick Save',
    short_name: 'Save',
    description: 'Quickly save content',
    url: '/save',
    icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
  }
]
```

## Implementation Details

### PWA Service (`src/services/pwa.ts`)

Manages PWA-specific functionality:

```typescript
class PWAService {
  // Installation prompt management
  async showInstallPrompt(): Promise<boolean>
  
  // Update notifications
  async checkForUpdates(): Promise<boolean>
  
  // Share API integration
  async shareContent(data: ShareData): Promise<boolean>
  
  // Background sync registration
  async registerBackgroundSync(tag: string): Promise<void>
}
```

### Installation Prompt Component

```typescript
export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }
    
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('Install outcome:', outcome)
      setShowPrompt(false)
    }
  }
  
  // Component JSX
}
```

### Share Target Handler

```typescript
export function ShareTargetHandler({ onContentShared }: ShareTargetHandlerProps) {
  useEffect(() => {
    const handleSharedContent = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      
      if (urlParams.has('title') || urlParams.has('text') || urlParams.has('url')) {
        const sharedData = {
          title: urlParams.get('title') || '',
          text: urlParams.get('text') || '',
          url: urlParams.get('url') || ''
        }
        
        // Process shared content
        const contentItem = await contentService.saveContent({
          title: sharedData.title,
          content: sharedData.text,
          url: sharedData.url,
          source: 'share'
        })
        
        onContentShared(contentItem)
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/')
      }
    }
    
    handleSharedContent()
  }, [onContentShared])
  
  return null // This component doesn't render anything
}
```

## Caching Strategies

### Static Assets
- **CacheFirst** for images, fonts, and static resources
- **StaleWhileRevalidate** for HTML, CSS, and JavaScript
- **NetworkFirst** for API calls

### Content Data
- **IndexedDB** for persistent local storage
- **Memory cache** for frequently accessed items
- **Background sync** for offline operations

## Testing PWA Features

### Development Testing

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Enable PWA in development**
   - PWA features are enabled in development mode
   - Service worker registers automatically
   - Install prompt appears after user interaction

### Production Testing

1. **Build and serve**
   ```bash
   npm run build
   npm run preview
   ```

2. **Lighthouse Audit**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run PWA audit
   - Verify all PWA criteria are met

### Manual Testing Checklist

- [ ] App installs successfully
- [ ] Works offline after installation
- [ ] Share target receives content from other apps
- [ ] Service worker caches resources
- [ ] App shortcuts work from home screen
- [ ] Updates are handled gracefully

## Browser Support

### Desktop
- **Chrome 67+** - Full PWA support
- **Edge 79+** - Full PWA support
- **Firefox 58+** - Partial support (no installation)
- **Safari 11.1+** - Partial support (iOS only)

### Mobile
- **Chrome Android 67+** - Full support
- **Safari iOS 11.3+** - Full support
- **Samsung Internet 7.2+** - Full support
- **Firefox Android 58+** - Partial support

## Performance Optimizations

### Service Worker Optimizations
- **Precaching** critical resources
- **Runtime caching** for dynamic content
- **Cache versioning** for updates
- **Selective caching** to avoid storage bloat

### Bundle Optimizations
- **Code splitting** for lazy loading
- **Tree shaking** to remove unused code
- **Asset optimization** for faster loading
- **Compression** with gzip/brotli

## Security Considerations

### HTTPS Requirement
- PWAs require HTTPS in production
- Service workers only work over secure connections
- Use Let's Encrypt for free SSL certificates

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

### Permissions
- Request permissions only when needed
- Provide clear explanations for permission requests
- Handle permission denials gracefully

## Future Enhancements

### Planned Features
- **Push notifications** for content updates
- **Background sync** for content synchronization
- **File system access** for local file management
- **Contact picker** for sharing with contacts

### Advanced PWA Features
- **Periodic background sync** for regular updates
- **Web locks** for concurrent operation handling
- **Payment request** for premium features
- **Credential management** for authentication