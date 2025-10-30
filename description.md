# Academic Matchmaker – Module Overview and Recent Work

This document summarizes each major module in the app and the recent enhancements delivered in this branch.

## Modules

### 1) Authentication & Onboarding
- Email/password auth via Firebase Auth.
- On first login, users complete onboarding and choose a role: `student` or `professor`.
- Profiles are stored in Firestore under one of:
  - `artifacts/${appId}/public/data/professors`
  - `artifacts/${appId}/public/data/students`
  - Legacy fallback: `artifacts/${appId}/public/data/users` (with `userType`).

### 2) Profile System
- Rich academic profile with education, experience, publications, skills, projects, achievements, contact & verification.
- Inline tabs for editing and saving to Firestore.
- Public profile page at `/profile/:id` (read-only CV style):
  - Fetch by doc id; if missing, try name/slug and router state.
  - Displays all core fields with Tailwind cards.
  - Back button returns to Matchmaker (last results are restored).

### 3) Matchmaker
- AI-style matching UI, now backed by Firestore for deterministic filtering.
- Audience filter (NEW): search `professors`, `students`, or `both`.
- Client search reads the appropriate collections and ranks by a simple relevance score using name/title/university/researchArea/keywords.
- Result cards:
  - Click name or “View Profile” → `/profile/:id`.
  - “Start Conversation” creates a chat document.
- Activity logging:
  - `search` (query + resultCount)
  - `profile_view` (profileId + name)
  - `chat_start` (partnerId + name)
  - Stored at `users/{uid}/activity` with timestamps.

### 4) Chats
- Real-time chat using Firestore.
- Ensures a stable chat id derived from participants.
- Sidebar lists chats; main panel for messages.

### 5) Global Feed
- Post creator with text and file attachments.
- Realtime feed with likes and comments.

### 6) Admin Dashboard
- User and post metrics, recent items, and system cards.

## Recent Enhancements (Oct 2025)
- Added audience filter in Matchmaker and Firestore-backed search.
- Made results clickable to a new public profile route `/profile/:id`.
- Implemented session restoration for Matchmaker when returning from profile pages.
- Logged activities (search/profile_view/chat_start) and surfaced them on Dashboard.
- Fixed routing and auth transitions to land on Dashboard after login/logout.
- Hardened keyword rendering and profile fallbacks.

## Notes for Data
- Professors: `artifacts/${appId}/public/data/professors`
- Students: `artifacts/${appId}/public/data/students`
- Legacy Users: `artifacts/${appId}/public/data/users` (contains `userType`)

## How to Extend
- Backend: teach the RAG endpoint to accept `audience` and fuse with Firestore filters.
- Profiles: add more structured arrays (multiple education/experience entries) and render in the public view.
- Matchmaker: add advanced filters (university, department, min experience, keywords).
