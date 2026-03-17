# WhatsApp Clone Backend API

## Base URL
All routes are prefixed with `/api/v1`.

## Auth
Most routes require authentication via a JWT token. The server accepts the token from any of these locations:
- `Cookie` named `token` (set by `verify-otp`)
- `Authorization: Bearer <token>` header
- `x-access-token` header

## Standard Response Shape
All endpoints return JSON in this shape:

```json
{
  "status": "success" | "error",
  "message": "...",
  "data": {}
}
```

## Auth Endpoints
`POST /api/v1/auth/send-otp`
Input (JSON):
- `email` (string) OR
- `phoneNumber` (string) + `phoneSuffix` (string)
Output:
- `data.email` when email flow is used
- `data.fullNumber` when phone flow is used

`POST /api/v1/auth/verify-otp`
Input (JSON):
- `email` (string) + `otp` (string | number) OR
- `phoneNumber` (string) + `phoneSuffix` (string) + `otp` (string | number)
Output:
- `data.token` (JWT)
- `data.user` (user document)
Notes:
- Also sets an HttpOnly `token` cookie.

`GET /api/v1/auth/logout`
Auth: required
Output:
- Clears `token` cookie

## User Endpoints
`PUT /api/v1/user/update-profile`
Auth: required
Content-Type: `multipart/form-data`
Input (form-data):
- `media` (file, optional)
- `media` (string URL, optional)
- `username` (string, optional)
- `agreed` (boolean, optional)
- `about` (string, optional)
Output:
- `data` (updated user document)

`GET /api/v1/user/profile`
Auth: required
Output:
- `data` (current user document)

`GET /api/v1/user/users`
Auth: required
Output:
- `data` (array of users)
- Each item may include a `conversation` field if found

## Conversation Endpoints
`GET /api/v1/conversation/`
Auth: required
Output:
- `data.conversations` (array of conversations with `otherUser` and `lastMessage` populated)

`POST /api/v1/conversation/`
Auth: required
Input (JSON):
- `participant` (string user id)
Output:
- `data.conversation` (created conversation)

`DELETE /api/v1/conversation/:conversationId`
Auth: required
Output:
- Success message on deletion

`DELETE /api/v1/conversation/:conversationId/clear-chat`
Auth: required
Output:
- Success message on clear

## Message Endpoints
`POST /api/v1/message/send-message`
Auth: required
Content-Type: `multipart/form-data`
Input (form-data):
- `senderId` (string)
- `receiverId` (string)
- `content` (string, required if no file)
- `messageStatus` (string, optional)
- `media` (file, optional)
Output:
- `data` (created message with populated sender/receiver)

`GET /api/v1/message/:conversationId`
Auth: required
Output:
- `data` (array of messages)

`PUT /api/v1/message/read`
Auth: required
Input (JSON):
- `messageId` (string or array of strings)
Output:
- `data` (updated message(s))

`DELETE /api/v1/message/:messageId`
Auth: required
Output:
- Success message on deletion

`PUT /api/v1/message/:messageId`
Auth: required
Input (JSON):
- `content` (string)
Output:
- Success message on update

## Status Endpoints
`POST /api/v1/status/`
Auth: required
Content-Type: `multipart/form-data`
Input (form-data):
- `content` (string, required if no file)
- `media` (file, optional)
Output:
- `data` (created status with populated user/viewer)

`GET /api/v1/status/`
Auth: required
Output:
- `data` (array of statuses from other users)

`GET /api/v1/status/me`
Auth: required
Output:
- `data` (array of current user's statuses)

`GET /api/v1/status/:statusId/view`
Auth: required
Output:
- `data` (updated status after view is recorded)

`DELETE /api/v1/status/:statusId/delete`
Auth: required
Output:
- Success message on deletion
