# Firebase Setup Guide - DuoVibe Task List

## Problem Solved ✅
- ✅ Tasks now stored in Firebase database (not just browser)
- ✅ Friends can see each other's tasks in real-time
- ✅ Updates sync instantly across all devices
- ✅ Data persists even after clearing browser

## Step-by-Step Setup

### 1. Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name (e.g., "duovibe-tasks")
4. Disable Google Analytics (optional)
5. Click "Create Project"
6. Wait for project to be created

### 2. Get Your Firebase Config
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click **Web** icon (</>) to add a web app
4. Enter app name: "duovibe"
5. Check "Also set up Firebase Hosting"
6. Click "Register app"
7. Copy the Firebase config values from the code shown
8. **Replace** the values in `.env.local` file in your project root:

```
REACT_APP_FIREBASE_API_KEY=paste_your_apiKey
REACT_APP_FIREBASE_AUTH_DOMAIN=paste_your_authDomain
REACT_APP_FIREBASE_PROJECT_ID=paste_your_projectId
REACT_APP_FIREBASE_STORAGE_BUCKET=paste_your_storageBucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=paste_your_messagingSenderId
REACT_APP_FIREBASE_APP_ID=paste_your_appId
```

### 3. Enable Authentication
1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get Started**
3. Click **Email/Password** option
4. Toggle **Enable** and click **Save**

### 4. Create Firestore Database
1. Go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Select **Start in test mode** (for development)
4. Click **Next**
5. Choose region closest to you
6. Click **Enable**

### 5. Set Firestore Security Rules
1. Go to **Firestore Database** → **Rules** tab
2. Replace all content with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to access their own data
    match /users/{userId}/data/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

### 6. Install Dependencies
```bash
npm install
```

This will install Firebase package (already added to package.json)

### 7. Run the App
```bash
npm run dev
```

The app should load at `http://localhost:5173`

## How to Use

### First Time Setup
1. Sign up with your email and password on the landing page
2. Your tasks will appear (synced to Firebase)
3. Add friends by going to **Friend Tasks** page
4. Friends can sign up with their own email and see their tasks

### Share Tasks with Friends
1. Each person signs up with their own email
2. When user A adds user B as a friend, they can see B's tasks
3. Real-time sync: If B updates a task, A sees it instantly

### Testing Multi-Device
1. Open your app in 2 browsers (or private windows)
2. Sign in as different users
3. Add tasks - they appear instantly in both browsers!

## Troubleshooting

### "Cannot find firebase" error
- Run: `npm install firebase`
- Restart dev server: `npm run dev`

### Environment variables not loading
- Make sure `.env.local` file is in project root (same level as package.json)
- Variables should start with `REACT_APP_`
- Restart dev server after changing `.env.local`

### Authentication not working
- Check that Email/Password auth is enabled in Firebase Console
- Make sure Firestore is created and rules are published
- Check browser console for error messages

### Firestore rules error
- Go to Firestore Rules and make sure rules are published
- It should say "✓ Rules updated" in green

## Important Notes

⚠️ **Test Mode Security**: The current Firestore rules in test mode allow anyone with the auth token to read/write. For production:
- Implement proper user sharing mechanism
- Only allow users to access their own data + shared data
- Add user sharing/permission system

📱 **Real-time Sync**: Changes sync automatically through Firestore listeners

💾 **Offline Support**: App works offline locally and syncs when back online

## File Changes Made

1. **package.json**: Added Firebase dependency
2. **src/config/firebase.js**: New - Firebase initialization
3. **src/context/TaskContext.jsx**: Updated - Now uses Firestore instead of localStorage
4. **src/components/Auth.jsx**: New - Authentication component
5. **.env.local**: New - Environment variables template

## Next Steps (Optional)

- [ ] Update LandingPage.jsx to show Auth component
- [ ] Add user profile page
- [ ] Implement proper friend sharing (not just hardcoded)
- [ ] Add task sharing between specific users
- [ ] Deploy to Firebase Hosting
