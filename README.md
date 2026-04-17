# Task Management System

A production-ready, full-stack Task Management Web Application featuring JWT authentication, role-based access control, real-time updates via Socket.io, file uploads, and containerized deployment with Docker.

---

## Features

- **Authentication**: User registration & login with JWT (access + refresh tokens in httpOnly cookies)
- **Role-Based Access Control**: `USER` and `ADMIN` roles with fine-grained permissions
- **Task CRUD**: Create, read, update, delete tasks with filtering, sorting, and pagination
- **File Uploads**: Attach up to 3 PDF files (max 5 MB each) per task
- **Document Management**: View, download, and delete attached documents
- **Real-Time Updates**: Socket.io WebSockets push live task changes to all connected clients
- **Admin Panel**: Admin can manage all users and all tasks
- **Dashboard**: Stats overview with Recharts bar chart
- **Comprehensive Testing**: Jest + Supertest (backend), Vitest + React Testing Library (frontend)
- **API Documentation**: Swagger UI at `/api/docs`
- **Docker**: Single command `docker-compose up --build` starts everything

---

## Tech Stack

| Layer      | Technology                         | Version |
|------------|-------------------------------------|---------|
| Frontend   | React                               | 19      |
| Frontend   | Vite                                | 6       |
| Frontend   | TailwindCSS                         | 4       |
| Frontend   | Redux Toolkit                       | 2       |
| Frontend   | React Router                        | 7       |
| Frontend   | Axios                               | 1       |
| Frontend   | Recharts                            | 2       |
| Frontend   | Socket.io-client                    | 4       |
| Backend    | Node.js                             | 22 LTS  |
| Backend    | Express                             | 5       |
| Database   | MongoDB                             | 8       |
| Database   | Mongoose                            | 8       |
| Auth       | JWT (access + refresh) + bcryptjs   |         |
| API Docs   | swagger-jsdoc + swagger-ui-express  |         |
| Tests BE   | Jest 29 + Supertest                 |         |
| Tests FE   | Vitest 2 + React Testing Library 16 |         |
| Realtime   | Socket.io                           | 4       |
| Container  | Docker + docker-compose             |         |

---

## Folder Structure

```
task-manager/
├── docker-compose.yml
├── README.md
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   ├── jest.config.js
│   ├── uploads/
│   ├── seed/seed.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── tasks.test.js
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       │   ├── db.js
│       │   └── swagger.js
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── role.middleware.js
│       │   ├── upload.middleware.js
│       │   └── error.middleware.js
│       ├── models/
│       │   ├── User.model.js
│       │   ├── Task.model.js
│       │   └── Document.model.js
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   └── tasks/
│       └── utils/
│           ├── jwt.utils.js
│           └── response.utils.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/axios.js
        ├── store/
        ├── routes/
        ├── hooks/
        ├── pages/
        ├── components/
        └── tests/
```

---

## Prerequisites

- **Node.js** 22 LTS
- **Docker Desktop** (latest)
- **Git**

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd task-manager
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env and set your secrets
npm install
npm run dev
```

### 3. Frontend setup (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

### 4. Start MongoDB locally

```bash
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:8
```

### 5. Seed the database

```bash
cd backend
npm run seed
```

---

## Docker Setup (Recommended)

```bash
# From project root
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Swagger UI: http://localhost:5000/api/docs

To seed data in Docker:

```bash
docker exec taskapp_backend node seed/seed.js
```

---

## Environment Variables

| Variable               | Description                           | Example                                         |
|------------------------|---------------------------------------|-------------------------------------------------|
| `PORT`                 | Backend server port                   | `5000`                                          |
| `NODE_ENV`             | Environment                           | `development`                                   |
| `CLIENT_URL`           | Frontend URL for CORS                 | `http://localhost:3000`                         |
| `MONGODB_URI`          | MongoDB connection string             | `mongodb://admin:password@localhost:27017/taskdb?authSource=admin` |
| `JWT_ACCESS_SECRET`    | JWT access token secret (32+ chars)   | `your_super_secret_access_key_min_32_chars_here`|
| `JWT_REFRESH_SECRET`   | JWT refresh token secret (32+ chars)  | `your_super_secret_refresh_key_min_32_chars_here`|
| `JWT_ACCESS_EXPIRES`   | Access token expiry                   | `15m`                                           |
| `JWT_REFRESH_EXPIRES`  | Refresh token expiry                  | `7d`                                            |
| `UPLOAD_DIR`           | Directory for file uploads            | `uploads`                                       |
| `MAX_FILE_SIZE`        | Max upload file size in bytes         | `5242880`                                       |
| `MAX_FILES`            | Max number of files per task          | `3`                                             |
| `VITE_API_URL`         | (Frontend) API base URL               | `http://localhost:5000/api`                     |
| `VITE_SOCKET_URL`      | (Frontend) Socket.io server URL       | `http://localhost:5000`                         |

---

## Default Login Credentials

After running `npm run seed`:

| Email                 | Password   | Role  |
|-----------------------|------------|-------|
| admin@taskapp.com     | Admin@123  | ADMIN |
| user1@taskapp.com     | User@123   | USER  |
| user2@taskapp.com     | User@123   | USER  |

---

## API Endpoints Reference

| Method | Endpoint                          | Auth    | Description                       |
|--------|-----------------------------------|---------|-----------------------------------|
| POST   | /api/auth/register                | Public  | Register new user                 |
| POST   | /api/auth/login                   | Public  | Login                             |
| POST   | /api/auth/refresh                 | Cookie  | Refresh access token              |
| POST   | /api/auth/logout                  | Auth    | Logout                            |
| GET    | /api/users                        | Admin   | List users (filter/sort/paginate) |
| GET    | /api/users/:id                    | Auth    | Get user by ID                    |
| PUT    | /api/users/:id                    | Auth    | Update user                       |
| DELETE | /api/users/:id                    | Admin   | Delete user                       |
| GET    | /api/tasks                        | Auth    | List tasks (filter/sort/paginate) |
| GET    | /api/tasks/:id                    | Auth    | Get task by ID                    |
| POST   | /api/tasks                        | Auth    | Create task (multipart)           |
| PUT    | /api/tasks/:id                    | Auth    | Update task (multipart)           |
| DELETE | /api/tasks/:id                    | Auth    | Delete task                       |
| GET    | /api/tasks/:id/documents          | Auth    | Get documents for task            |
| GET    | /api/documents/:docId/download    | Auth    | Download document                 |
| DELETE | /api/documents/:docId             | Auth    | Delete document                   |

Full interactive documentation: **http://localhost:5000/api/docs**

---

## Design Decisions

### Why MongoDB?
Document-oriented storage naturally maps to task objects with embedded metadata. Flexible schema during rapid iteration. Mongoose provides schema validation and relationships via ObjectId refs.

### Why JWT in httpOnly Cookies?
Prevents XSS attacks from accessing tokens via JavaScript. Access token (15 min) + refresh token (7 days) pattern minimizes attack window while maintaining good UX. Axios interceptors transparently handle token refresh.

### Why Socket.io?
Provides real-time bidirectional communication with automatic fallback (WebSocket → long polling). Built-in rooms, namespaces, and reconnection logic are superior to raw WebSocket for production use.

### File Storage Approach
Files stored on local filesystem in `uploads/` folder per the assignment requirements. File metadata (original name, MIME type, size, path) stored in MongoDB `Document` collection linked to task via ObjectId. In production, swap the storage driver to AWS S3 or similar without changing the API contract.

---

## Testing

### Backend Tests

```bash
cd backend
npm test
# View HTML coverage report:
open coverage/lcov-report/index.html
```

### Frontend Tests

```bash
cd frontend
npm test
# View coverage:
open coverage/index.html
```

Target: **≥ 80% coverage** on statements, branches, functions, and lines.

---

## Screenshots

> _Add screenshots of Login, Dashboard, Task List, Task Detail, and Admin Users pages here._

---

## License

MIT
