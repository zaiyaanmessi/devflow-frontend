# Role-Based Permissions

This document outlines the different powers and permissions for each user role in the application.

## 👨‍🎓 Student (user role)

**Basic User Powers:**
- ✅ Ask questions
- ✅ Answer questions
- ✅ Vote on questions and answers
- ✅ Comment on questions and answers
- ✅ Accept answers to their own questions
- ✅ Edit their own questions
- ✅ Delete their own questions
- ✅ Edit their own answers
- ✅ Delete their own answers

- ✅ Delete their own comments

**Restrictions:**
- ❌ Cannot edit/delete other users' questions
- ❌ Cannot edit/delete other users' answers
- ❌ Cannot verify answers
- ❌ Cannot pin questions
- ❌ Cannot delete other users' comments

## 👨‍🏫 Expert

**All Student Powers PLUS:**
- ✅ Verify answers (mark answers as verified/correct)
- ✅ Pin their own questions (highlight important questions)
- ✅ Expert badge displayed on their answers
- ✅ Verified answers show a "✓ Verified" badge

**Restrictions:**
- ❌ Can only edit/delete their own questions (not others')
- ❌ Can only edit/delete their own answers (not others')
- ❌ Cannot delete other users' comments
- ❌ Cannot pin other users' questions

**Expert-Only Features:**
- **Verify Answer**: Experts can verify any answer (except their own) to mark it as correct/verified
- **Pin Question**: Experts can pin their own questions to highlight them
- **Expert Badge**: Their answers are marked with an expert badge

## 👨‍💼 Admin

**All Expert Powers PLUS:**
- ✅ Edit ANY question (not just their own)
- ✅ Delete ANY question (not just their own)
- ✅ Edit ANY answer (not just their own)
- ✅ Delete ANY answer (not just their own)
- ✅ Delete ANY comment (full moderation)
- ✅ Full moderation controls

**Admin-Only Features:**
- **Full Moderation**: Can edit/delete any content in the system
- **Delete Any Answer**: Special admin action to delete any answer
- **Complete Control**: Full administrative powers over all content

## Summary Table

| Feature | Student | Expert | Admin |
|---------|---------|--------|-------|
| Ask Questions | ✅ | ✅ | ✅ |
| Answer Questions | ✅ | ✅ | ✅ |
| Vote | ✅ | ✅ | ✅ |
| Comment | ✅ | ✅ | ✅ |
| Accept Own Answers | ✅ | ✅ | ✅ |
| Edit Own Questions | ✅ | ✅ | ✅ |
| Delete Own Questions | ✅ | ✅ | ✅ |
| Edit Own Answers | ✅ | ✅ | ✅ |
| Delete Own Answers | ✅ | ✅ | ✅ |
| Verify Answers | ❌ | ✅ | ✅ |
| Pin Own Questions | ❌ | ✅ | ✅ |
| Edit ANY Question | ❌ | ❌ | ✅ |
| Delete ANY Question | ❌ | ❌ | ✅ |
| Edit ANY Answer | ❌ | ❌ | ✅ |
| Delete ANY Answer | ❌ | ❌ | ✅ |
| Delete ANY Comment | ❌ | ❌ | ✅ |

## Implementation Notes

- **Student View**: Basic functionality, can only modify their own content
- **Expert View**: Includes verify answer button and pin question feature
- **Admin View**: Full moderation controls with ability to edit/delete any content
- **Permission Checks**: All edit/delete operations check user role and ownership
- **Backend Required**: Verify answer and pin question features require backend API endpoints

