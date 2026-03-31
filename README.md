# ChatApp — Real-Time Messaging

A full-stack real-time chat application built with the MERN stack and Socket.IO. Supports one-to-one private chats, group conversations.

---

## Features

- **Authentication** — Register, login, JWT-based sessions, bcrypt password hashing
- **Direct Chat** — One-to-one private messaging
- **Group Chat** — Create groups, add members
- **Real-Time Messaging** — Instant delivery via Socket.IO
- **Message Persistence** — All messages stored in MongoDB, history loads on open
- **Media Sharing** — Send images and files (stored locally on server)
- **Typing Indicators** — See when others are typing in real time
- **Online/Offline Status** — Live presence indicators
- **Message Timestamps** — Formatted time on every message
- **Auto-scroll** — Automatically scrolls to latest message
- **Responsive UI** — Works on mobile and desktop


## Folder Structure

```
chat-app/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar.jsx
│   │   │   ├── ChatBox.jsx
│   │   │   ├── InputBox.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── NewChatModal.jsx
│   │   │   ├── NewGroupModal.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ChatContext.jsx
│   │   ├── pages/
│   │   │   ├── ChatDashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── utils/
│   │   │   ├── axios.js
│   │   │   ├── helpers.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
└── server/                   # Express backend
    ├── config/
    │   ├── db.js             # MongoDB connection
    │   └── socket.js         # Socket.IO event handlers
    ├── controllers/
    │   ├── authController.js
    │   ├── chatController.js
    │   └── messageController.js
    ├── middleware/
    │   ├── authMiddleware.js  # JWT protection
    │   └── uploadMiddleware.js # Multer file handling
    ├── models/
    │   ├── User.js
    │   ├── Chat.js
    │   └── Message.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── chatRoutes.js
    │   └── messageRoutes.js
    ├── uploads/              # Uploaded files (auto-created)
    ├── index.js              # Entry point
    └── .env.example
```

---

## MongoDB Setup (Atlas)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Cluster** (free M0 tier works fine)
3. Under **Database Access**, create a user with read/write permissions
4. Under **Network Access**, add your IP (or `0.0.0.0/0` for dev)
5. Click **Connect** → **Connect your application**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/chatapp?retryWrites=true&w=majority
   ```
7. Paste it into `server/.env` as `MONGO_URI`

---

## Setup Instructions

### 1. Clone or copy the project

```bash
# If using git
git clone <your-repo-url>
cd chat-app
```

### 2. Backend setup

```bash
cd server
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/chatapp?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB connected: cluster0.xxxxx.mongodb.net
```

### 3. Frontend setup

Open a **new terminal**:

```bash
cd client
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open your browser at **http://localhost:5173**

---

## Running Both Together

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd chat-app/server && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd chat-app/client && npm run dev
```

---

## API Reference

### Auth
| Method | Endpoint              | Access  | Description              |
|--------|-----------------------|---------|--------------------------|
| POST   | /api/auth/register    | Public  | Register new user        |
| POST   | /api/auth/login       | Public  | Login and get JWT        |
| GET    | /api/auth/me          | Private | Get current user profile |
| GET    | /api/auth/search?q=   | Private | Search users by username |

### Chat
| Method | Endpoint                          | Access  | Description               |
|--------|-----------------------------------|---------|---------------------------|
| GET    | /api/chat                         | Private | Get all user chats        |
| POST   | /api/chat/direct                  | Private | Create/access direct chat |
| POST   | /api/chat/group                   | Private | Create group chat         |
| PUT    | /api/chat/group/:id/rename        | Private | Rename group              |
| PUT    | /api/chat/group/:id/add           | Private | Add member to group       |
| PUT    | /api/chat/group/:id/remove        | Private | Remove/leave group        |

### Messages
| Method | Endpoint                    | Access  | Description             |
|--------|-----------------------------|---------|-------------------------|
| POST   | /api/message                | Private | Send a message          |
| GET    | /api/message/:chatId        | Private | Get chat history        |
| PUT    | /api/message/:chatId/read   | Private | Mark messages as read   |

### Socket.IO Events

| Event           | Direction      | Payload                           |
|----------------|----------------|-----------------------------------|
| user:online    | Client → Server | userId                           |
| users:online   | Server → Client | [userId, ...]                    |
| chat:join      | Client → Server | chatId                           |
| chat:leave     | Client → Server | chatId                           |
| message:send   | Client → Server | message object                   |
| message:receive| Server → Client | message object                   |
| typing:start   | Client → Server | { chatId, userId, username }     |
| typing:stop    | Client → Server | { chatId, userId }               |
| typing:start   | Server → Client | { userId, username }             |
| typing:stop    | Server → Client | { userId }                       |

---

## Screenshots

> _Add screenshots here after running the app_

- [ ] Login screen
- [ ] Register screen
- [ ] Chat dashboard (desktop)
- [ ] Direct message view
- [ ] Group chat view
- [ ] Mobile layout

---

## Notes

- Uploaded files are stored in `server/uploads/` — for production, use S3 or Cloudinary
- JWT tokens expire in 7 days
- The `uploads/` folder is served statically at `/uploads`
- The Vite dev server proxies `/api` and `/uploads` to port 5000 automatically
- For production builds, set `NODE_ENV=production` and serve the built React app from Express
