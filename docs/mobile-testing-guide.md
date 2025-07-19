# Mobile Testing Guide for Universal Pocket

This guide explains how to test PWA sharing functionality on mobile devices, specifically Web Share API and share target features.

## Prerequisites

- Universal Pocket development server running on `localhost:5174`
- Android phone with Chrome browser
- USB cable for connecting phone to Mac
- Mac with Chrome browser

## Method 1: Chrome DevTools Remote Debugging (Recommended)

### Setup Steps

1. **Enable Developer Options on Android Phone:**
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times to enable Developer Options
   - Go back to **Settings** → **Developer Options**
   - Enable **USB Debugging**

2. **Connect Phone to Mac:**
   - Connect Android phone to Mac via USB cable
   - When prompted on phone, allow USB debugging
   - Select "Always allow from this computer" for convenience

3. **Setup Chrome DevTools on Mac:**
   - Open Chrome on your Mac
   - Press **F12** or right-click → **Inspect** to open DevTools
   - Click **⋮** (three dots) → **More tools** → **Remote devices**
   - Check **"Discover USB devices"** if not already checked
   - Your phone should appear in the device list

4. **Access Development Server:**
   - In the Remote devices panel, find your phone
   - In the address bar for your phone, type: `localhost:5174`
   - This will load your Universal Pocket app on the phone
   - The localhost traffic is forwarded through the USB connection

### Testing PWA Installation

1. **Install as PWA:**
   - On your phone, visit the forwarded `localhost:5174`
   - Look for Chrome's "Add to Home Screen" installation prompt
   - Tap "Add" to install Universal Pocket as a PWA
   - The app icon should appear on your home screen

2. **Verify Installation:**
   - Open the installed PWA from home screen
   - Verify it opens in standalone mode (no browser UI)
   - Check that the app loads your saved content

### Testing Web Share Target

1. **Test Sharing from Chrome Mobile:**
   - Open any webpage in Chrome mobile
   - Tap the **Share** button
   - Look for "Universal Pocket" in the share menu
   - Select it and verify content is saved
   - Check that you're redirected to the app with success message

2. **Test Sharing from Instagram:**
   - Open Instagram mobile app
   - Find any post you want to save
   - Tap the **Share** button (paper airplane icon)
   - Tap **"Share to..."** or similar option
   - Look for "Universal Pocket" in the system share sheet
   - Select it and verify the Instagram post URL is saved

3. **Test Sharing Text Content:**
   - In any app, select some text
   - Use the share menu to share to Universal Pocket
   - Verify the text is saved as a note

## Method 2: Local Network Access (Limited)

### Setup Steps

1. **Find Mac's IP Address:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Look for an IP like `192.168.x.x` or `10.x.x.x`

2. **Ensure Same WiFi Network:**
   - Connect both Mac and phone to the same WiFi network
   - Make sure it's a private network (not public WiFi)

3. **Access via IP:**
   - On your phone, open Chrome
   - Visit `http://[YOUR_MAC_IP]:5174`
   - Example: `http://192.168.1.100:5174`

### Limitations

⚠️ **Important**: This method has significant limitations:
- Web Share API requires HTTPS, so sharing won't work over HTTP
- You can test the UI and basic functionality
- PWA installation may work but share target features won't
- Only use this for basic UI testing

## Method 3: Using ngrok (Alternative)

If the above methods don't work, you can use ngrok as a fallback:

### Setup Steps

1. **Install ngrok:**
   ```bash
   # Via Homebrew
   brew install ngrok
   
   # Or download from https://ngrok.com
   ```

2. **Create HTTPS Tunnel:**
   ```bash
   # Start your dev server first
   npm run dev
   
   # In another terminal, create tunnel
   ngrok http 5174
   ```

3. **Use HTTPS URL:**
   - ngrok will provide an HTTPS URL like `https://abc123.ngrok.io`
   - Use this URL on your phone for full PWA testing
   - All Web Share API features will work properly

## Testing Checklist

### Before Testing
- [ ] Development server running on `localhost:5174`
- [ ] Phone connected and USB debugging enabled
- [ ] Chrome DevTools remote devices showing your phone
- [ ] App accessible on phone via `localhost:5174`

### PWA Installation
- [ ] Install prompt appears in Chrome mobile
- [ ] App installs successfully to home screen
- [ ] App opens in standalone mode
- [ ] App shows existing saved content

### Web Share Target Testing
- [ ] Share from Chrome mobile → Universal Pocket appears in share menu
- [ ] Share from Instagram → Universal Pocket appears in system share
- [ ] Share URL → Correctly saves with metadata
- [ ] Share text → Saves as note
- [ ] Success/error messages display properly
- [ ] Redirects back to main app after saving

### Functionality Testing
- [ ] Shared content appears in content list
- [ ] Metadata extraction works (titles, descriptions, thumbnails)
- [ ] Offline saving works (disconnect WiFi, share content)
- [ ] Content syncs when back online
- [ ] Delete functionality works
- [ ] Search and filtering work

## Troubleshooting

### Common Issues

1. **Phone Not Detected:**
   - Try different USB cable
   - Disable and re-enable USB debugging
   - Restart Chrome DevTools

2. **Localhost Not Loading:**
   - Ensure dev server is running
   - Try refreshing the remote devices panel
   - Check firewall settings on Mac

3. **PWA Install Prompt Not Showing:**
   - Clear Chrome data on phone
   - Ensure app meets PWA criteria
   - Check manifest.json is loading properly

4. **Share Target Not Appearing:**
   - Ensure PWA is properly installed (not just bookmarked)
   - Check that manifest includes share_target configuration
   - Restart Chrome after PWA installation

5. **Sharing Fails:**
   - Verify you're using HTTPS (via ngrok if needed)
   - Check browser console for errors
   - Ensure service worker is registered

### Debug Information

To gather debug info while testing:

1. **Check Console Logs:**
   - Use Chrome DevTools remote debugging
   - Monitor console for errors during sharing

2. **Verify PWA Status:**
   - In Chrome DevTools → Application tab
   - Check Manifest section for share_target config
   - Verify Service Worker registration

3. **Test Share Target URL:**
   - Manually visit: `https://yourapp.com/save?url=https://example.com&title=Test`
   - Should trigger save workflow

## Expected Results

### Successful Mobile Sharing Flow

1. **User shares from any app**
2. **"Universal Pocket" appears in share menu**
3. **User selects Universal Pocket**
4. **App opens with loading screen**
5. **Content is processed and saved**
6. **Success message is shown**
7. **User is redirected to main app**
8. **Saved content appears in the list**

### Content Types to Test

- **Web Articles:** Share from Chrome mobile
- **Social Media:** Share from Instagram, Twitter
- **YouTube Videos:** Share video URLs
- **Plain Text:** Select and share text from any app
- **Images:** Share images from gallery apps

This completes the mobile testing setup. Follow these steps when you're on a secure network to fully test the PWA sharing functionality.