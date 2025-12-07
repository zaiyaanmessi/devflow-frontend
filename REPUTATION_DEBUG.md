# Reputation Update Debugging Guide

## Current Implementation

When an answer is accepted, the frontend:
1. Calls the API to accept the answer
2. Refreshes the question data
3. If the answerer is the current user, fetches updated user data
4. Updates localStorage with new reputation
5. Dispatches event to update Navbar

## How to Debug

### Step 1: Check Browser Console
Open browser DevTools (F12) and check the Console tab when accepting an answer. You should see:
- `Updated user reputation: [number]`
- `Reputation updated: [old] → [new]`

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Accept an answer
3. Look for these requests:
   - `PUT /questions/[id]/answers/[answerId]/accept` - Should return 200
   - `GET /questions/[id]` - Should return updated question data
   - `GET /users/[userId]` - Should return updated user with new reputation

### Step 3: Check Backend Response
The accept answer API should:
- Update the answerer's reputation in the database
- Return the updated answer with answerer data including new reputation

### Step 4: Verify Backend Implementation
Check your backend code for the accept answer endpoint:
- Does it increment the answerer's reputation?
- Does it return the updated answerer data in the response?
- Is the reputation field being updated in the database?

## Common Issues

### Issue 1: Backend Not Updating Reputation
**Symptom**: Reputation doesn't change in database
**Fix**: Check backend code - ensure reputation is incremented when answer is accepted

### Issue 2: API Response Doesn't Include Updated User
**Symptom**: Frontend can't get updated reputation
**Fix**: Ensure backend returns the answerer object with updated reputation in the response

### Issue 3: Answerer ID Mismatch
**Symptom**: Frontend can't identify the answerer
**Fix**: Check if answerer is stored as `answerer._id` or `answerer.id` in your backend

### Issue 4: localStorage Not Updating
**Symptom**: Reputation updates in database but not in UI
**Fix**: Check browser console for errors, verify localStorage is accessible

## Testing Steps

1. **Login as User A**
2. **Login as User B in another browser**
3. **User A asks a question**
4. **User B answers the question**
5. **User A accepts User B's answer**
6. **Check User B's reputation** - should increase
7. **Check User B's navbar** - should show updated reputation
8. **Check User B's profile** - should show updated reputation

## Expected Behavior

- When an answer is accepted, the answerer's reputation should increase
- The increase should be visible immediately in:
  - The navbar (if answerer is logged in)
  - The profile page
  - The question detail page (answerer's reputation in answer card)
- The reputation should persist after page refresh

