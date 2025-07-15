# Requirements Document

## Introduction

Universal Pocket is a read-later bookmarking application designed to seamlessly capture and organize content across all modalities - from blog posts and notes to YouTube videos and Instagram reels. The core philosophy is extreme simplicity: users should be able to save any content with a single action from any platform, making it even more streamlined than existing solutions like Google Keep. The application prioritizes universal accessibility and frictionless content capture over complex organization features.

## Requirements

### Requirement 1

**User Story:** As a user, I want to save any type of content (text, URLs, videos, social media) with a single action, so that I can quickly capture things without interrupting my workflow.

#### Acceptance Criteria

1. WHEN a user shares a URL from any app THEN the system SHALL automatically detect the content type and save it with appropriate metadata
2. WHEN a user submits text content THEN the system SHALL save it as a note with auto-generated title from the first 50 characters
3. WHEN a user saves a YouTube video URL THEN the system SHALL extract and store the video title, thumbnail, and duration
4. WHEN a user saves an Instagram reel URL THEN the system SHALL extract and store the post metadata and thumbnail
5. WHEN a user saves any web URL THEN the system SHALL extract page title, description, and preview image

### Requirement 2

**User Story:** As a user, I want the app to be accessible from any device and platform, so that I can save content regardless of where I encounter it.

#### Acceptance Criteria

1. WHEN a user accesses the app from a web browser THEN the system SHALL provide a fully functional web interface
2. WHEN a user uses the web share API THEN the system SHALL accept shared content from any compatible app
3. WHEN a user bookmarks the save URL THEN the system SHALL provide a quick-save bookmarklet for desktop browsers
4. WHEN a user accesses the app on mobile THEN the system SHALL provide a responsive interface optimized for touch interaction
5. WHEN a user has Raycast installed THEN the system SHALL provide native Raycast commands for instant content saving
6. WHEN a user runs a Raycast command THEN the system SHALL communicate with the web app through a local API server

### Requirement 3

**User Story:** As a user, I want to view all my saved content in a simple, organized way, so that I can easily find and consume what I've saved.

#### Acceptance Criteria

1. WHEN a user opens the main interface THEN the system SHALL display all saved items in reverse chronological order
2. WHEN a user views the content list THEN the system SHALL show appropriate previews (thumbnails for videos, text snippets for articles)
3. WHEN a user clicks on a saved item THEN the system SHALL open the original content in a new tab/window
4. WHEN a user wants to remove an item THEN the system SHALL provide a simple delete action
5. WHEN a user has many saved items THEN the system SHALL provide basic filtering by content type (text, video, article, social)

### Requirement 4

**User Story:** As a user, I want the system to automatically organize my content by type, so that I don't have to manually categorize everything I save.

#### Acceptance Criteria

1. WHEN a user saves a YouTube or video URL THEN the system SHALL automatically tag it as "video" type
2. WHEN a user saves an Instagram, Twitter, or social media URL THEN the system SHALL automatically tag it as "social" type
3. WHEN a user saves a blog post or article URL THEN the system SHALL automatically tag it as "article" type
4. WHEN a user saves plain text THEN the system SHALL automatically tag it as "note" type
5. WHEN the system cannot determine content type THEN the system SHALL default to "link" type

### Requirement 5

**User Story:** As a user, I want the app to work offline and sync when connected, so that I can save content even without internet access.

#### Acceptance Criteria

1. WHEN a user is offline THEN the system SHALL allow saving text content locally
2. WHEN a user is offline THEN the system SHALL queue URL-based saves for processing when online
3. WHEN the user comes back online THEN the system SHALL automatically process queued items and extract metadata
4. WHEN a user views saved content offline THEN the system SHALL show cached previews and metadata
5. WHEN a user deletes items offline THEN the system SHALL sync deletions when reconnected

### Requirement 6

**User Story:** As a user, I want minimal setup and no account creation required, so that I can start using the app immediately.

#### Acceptance Criteria

1. WHEN a user first visits the app THEN the system SHALL work immediately without requiring registration
2. WHEN a user wants to sync across devices THEN the system SHALL provide optional simple authentication
3. WHEN a user chooses local-only mode THEN the system SHALL store all data locally in the browser
4. WHEN a user wants to export their data THEN the system SHALL provide a simple export function
5. WHEN a user wants to import existing bookmarks THEN the system SHALL accept common bookmark formats

### Requirement 7

**User Story:** As a Raycast user, I want ultra-fast content saving through native Raycast commands with smart input detection, so that I can capture content without leaving my current workflow.

#### Acceptance Criteria

1. WHEN a user types "save" in Raycast THEN the system SHALL provide a quick save command that accepts any content type
2. WHEN a user runs "save clipboard" in Raycast THEN the system SHALL automatically save the current clipboard content
3. WHEN a user runs "note" in Raycast THEN the system SHALL provide an optimized text input interface for quick notes
4. WHEN a user runs "capture" in Raycast THEN the system SHALL intelligently save content based on the currently active application
5. WHEN a user saves content through Raycast THEN the system SHALL provide instant feedback and auto-detect content type
6. WHEN a user saves content through Raycast THEN the system SHALL extract metadata in the background without blocking the save operation