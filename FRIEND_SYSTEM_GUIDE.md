# Friend System - Complete Setup Guide

## What's New ✨

Your DuoVibe app now has a **complete friend sharing system**! Users can:
- 🔍 Search for friends by email
- 📨 Send and receive friend requests
- 👥 Manage their friend list
- 👀 View their friends' tasks in real-time
- 🗑️ Remove friends

## How It Works

### Database Structure

```
users/{userId}
├── email: "user@example.com"
├── displayName: "username"
├── friends: [userId1, userId2, ...]
├── friendRequests: [userId3, ...]
└── data/
    └── tasks/{document}
        ├── myTasks: [...]
        ├── groupTasks: [...]
        └── updatedAt: timestamp
```

## User Flow

### 1. Adding a Friend

**User A** wants to add **User B** as a friend:

1. Click **"Add Friend"** button on Friend Tasks page
2. Enter User B's email address
3. Click **"Search"**
4. Click **"Send Friend Request"** ✅ Request sent!

**User B** will see a yellow notification with the friend request

### 2. Receiving Friend Requests

**User B** will see:
- A yellow banner at the top of Friend Tasks page
- Shows: "Friend Requests (1)"
- Shows User A's name and email
- **Accept** or **Reject** buttons

- If **Accept**: User A and B become friends
- If **Reject**: Request is deleted

### 3. Viewing Friend's Tasks

After becoming friends:
1. Go to **Friend Tasks** page
2. See all your friends in the tab buttons
3. Click a friend's name to view their tasks
4. Tasks update in real-time as they make changes
5. Click **Remove** to unfriend

## New Components

### `src/components/AddFriend.jsx`
Modal for searching and sending friend requests to other users by email

**Features:**
- Email search field
- User not found handling
- Send request button
- Success feedback

**Usage:**
```jsx
import AddFriend from '../components/AddFriend';

// In your component:
const [showModal, setShowModal] = useState(false);

return (
  <>
    <button onClick={() => setShowModal(true)}>Add Friend</button>
    {showModal && <AddFriend onClose={() => setShowModal(false)} />}
  </>
);
```

### `src/components/FriendRequests.jsx`
Shows pending friend requests with accept/reject options

**Features:**
- Lists all incoming friend requests
- Shows sender's name and email
- Accept/Reject buttons
- Only displays if there are requests
- Yellow alert styling

**Usage:**
```jsx
import FriendRequests from '../components/FriendRequests';

// In your component:
return (
  <>
    <FriendRequests />
    {/* Rest of your content */}
  </>
);
```

## Updated Files

### `src/context/TaskContext.jsx`
**New State:**
- `friends` - List of friend objects with their profile data
- `friendRequests` - List of incoming friend request senders

**New Functions:**
```javascript
// Search for a user by email
const result = await searchUsers('user@example.com');
// Returns: { id, email, displayName } or null

// Send a friend request
await sendFriendRequest(userId);

// Accept a friend request
await acceptFriendRequest(userId);

// Reject a friend request
await rejectFriendRequest(userId);

// Remove a friend
await removeFriend(friendId);

// Get a friend's tasks
const friendTasks = await getFriendTasks(friendId);
```

### `src/pages/FriendTasks.jsx`
**Complete rewrite:**
- Shows actual friends from database (not hardcoded)
- Friend selector tabs
- Friend request notifications
- Empty state with "Add Friend" button
- Remove friend button
- Real-time task updates
- Read-only task display

## Firestore Rules Update

Your existing Firestore rules already support this! But here's what they do:

```firestore
match /users/{userId}/data/{document=**} {
  allow read, write: if request.auth.uid == userId;
}
```

This means:
- ✅ Each user can read/write their own tasks
- ✅ Friends can search for each other (users collection is public for email search)
- ✅ Friend list is stored in user document
- ⚠️ For production, consider adding friend-specific read rules

## Testing the Friend System

### Test Case 1: Send Friend Request
1. Open 2 browser windows (or incognito tabs)
2. Sign up in both with different emails:
   - Window A: `alice@example.com`
   - Window B: `bob@example.com`
3. In Window A, go to Friend Tasks
4. Click "Add Friend"
5. Enter `bob@example.com`
6. Click "Send Friend Request" ✅
7. Switch to Window B
8. Should see yellow banner with Alice's request
9. Click "Accept" ✅
10. Both users are now friends!
11. Window A: Should see "bob" in friend tabs
12. Click on "bob" tab to see their tasks

### Test Case 2: Real-time Sync
1. After becoming friends (from Test Case 1)
2. In Window B (Bob), add a new task: "Buy groceries"
3. In Window A (Alice), view Bob's tasks
4. Should see the new task appear instantly! ⚡

### Test Case 3: Remove Friend
1. In Window A (Alice), click "Remove" button on Bob's tasks
2. In Window B (Bob), Friend Tasks page should update
3. Alice disappears from Bob's friend list
4. Everything syncs!

## Troubleshooting

### "User not found" when searching
- ✅ Check if the email is correct and registered
- ✅ The user must have signed up and logged in at least once
- ✅ Email is case-sensitive in search

### Friend request not appearing
- ✅ Refresh the page (WebSocket might not have updated yet)
- ✅ Check that both users exist in database
- ✅ Make sure Firestore rules are published

### Friend tasks not loading
- ✅ Ensure friend has set up Firestore (has tasks document)
- ✅ Check browser console for errors
- ✅ Verify friend is actually in your friends list

### Can't add self as friend
- ✅ App checks if email is yours and shows "That's you!" message
- ✅ This is intentional!

## Next Steps (Optional Enhancements)

- [ ] Add friend groups/circles
- [ ] Block users feature
- [ ] Friend activity feed
- [ ] Send direct messages with friends
- [ ] Set custom nicknames for friends
- [ ] Friend achievements/badges
- [ ] Collaborative task lists
- [ ] Share specific tasks only

## Security Notes

⚠️ **Current Setup (Development)**
- All users can search for each other by email
- Friend lists are public within Firestore
- Tasks are private to their owner

🔒 **For Production:**
- Add user privacy settings
- Implement private/public profiles
- Consider user blocking feature
- Add reporting system for abuse
- Rate limit friend requests
- Verify email before full access

## File Changes Summary

```
src/
├── components/
│   ├── AddFriend.jsx (NEW)
│   ├── FriendRequests.jsx (NEW)
│   ├── Auth.jsx (updated)
│   └── Layout.jsx (updated)
├── context/
│   └── TaskContext.jsx (updated with friend functions)
├── pages/
│   ├── FriendTasks.jsx (REWRITTEN)
│   └── LandingPage.jsx (updated)
└── config/
    └── firebase.js (no changes needed)
```

## API Reference

### TaskContext Methods

```javascript
// Search for users
async searchUsers(email: string): Promise<UserObj | null>

// Friend requests
async sendFriendRequest(recipientId: string): Promise<void>
async acceptFriendRequest(senderId: string): Promise<void>
async rejectFriendRequest(senderId: string): Promise<void>

// Friend management
async removeFriend(friendId: string): Promise<void>
async getFriendTasks(friendId: string): Promise<TasksObj | null>

// Task operations (existing)
async addTask(listType: string, text: string): Promise<void>
async toggleTask(listType: string, id: string): Promise<void>
async deleteTask(listType: string, id: string): Promise<void>

// Context state
tasks: Object              // Current user's tasks
friends: Array<UserObj>   // List of friends
friendRequests: Array<UserObj>  // Incoming requests
user: FirebaseUser | null  // Current authenticated user
loading: boolean
error: string | null
```

## Questions?

If you encounter any issues:
1. Check browser console for error messages
2. Verify Firestore rules are published
3. Make sure `.env.local` has correct Firebase credentials
4. Test with `npm run dev` and try again

Enjoy your friend-sharing task app! 🎉
