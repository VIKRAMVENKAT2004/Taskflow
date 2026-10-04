<<<<<<< HEAD
# TaskFlow — Full Stack Project Management App (MERN)

React + Redux Toolkit + Vite | Node.js + Express | MongoDB + Mongoose | JWT

## Setup (needs Node 18+ and MongoDB running locally or an Atlas URI)

### 1. Backend
```bash
cd server
npm install
cp .env.example .env      # edit MONGO_URI and JWT_SECRET
npm run seed              # optional demo data
npm run dev               # http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

Demo logins after seeding (password `123456`): `admin@demo.com`, `member@demo.com`.

## Features
- JWT auth, bcrypt hashing, role-based access (admin / member)
- Admin: create/delete projects, add members by email, create/assign/delete tasks
- Member: see own projects, move tasks assigned to them, comment
- Kanban drag-and-drop with optimistic UI + rollback on failure
- Task list API: pagination, keyword search, filter by status/assignee
- Dashboard stats via MongoDB aggregation (`$match` + `$group`)
- Centralized error middleware, Mongoose validation, indexes on hot fields
- Responsive UI (desktop / tablet / mobile)

## API
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | auth |
| GET / POST | /api/projects | auth / admin |
| GET / DELETE | /api/projects/:id | member / owner |
| POST | /api/projects/:id/members | owner |
| GET | /api/projects/:id/stats | member |
| GET / POST | /api/projects/:projectId/tasks (`?page&limit&search&status&assignee`) | member / owner |
| PATCH / DELETE | /api/tasks/:id | owner (all fields) or assignee (status only) / owner |
| POST | /api/tasks/:id/comments | member |

## Deployment
- Backend (Render/Railway): set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL), `NODE_ENV=production`.
- Frontend (Vercel/Netlify): set `VITE_API_URL` to `https://<backend>/api`, build with `npm run build`.
=======
# Task-Flow
>>>>>>> 4d8794551e6dc4e5110e6865971325fb7dc8d98e
