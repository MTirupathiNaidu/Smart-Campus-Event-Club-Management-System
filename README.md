# 🎓 Smart Campus Event & Club Management System

A full-stack MERN application for managing campus events, clubs, registrations, attendance, and announcements with secure JWT authentication.

---

# 🚀 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcryptjs |
| QR Code | qrcode.react + html5-qrcode |
| Charts | Chart.js + react-chartjs-2 |
| API | REST API |

---

# ✨ Features

- JWT Authentication
- Role-Based Access (Admin, Coordinator, Student)
- Club Management
- Event Management
- Event Registration
- QR Code Attendance
- Announcements
- Analytics Dashboard
- Secure REST APIs
- MongoDB Atlas Cloud Database

---

# 📂 Project Structure

```
Smart-Campus-Event-Club-Management-System
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── scripts
│   ├── server.js
│   ├── package.json
│   └── vercel.json
│
└── README.md
```

---

# ⚙️ Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas Account

---

# 🗄️ MongoDB Setup

Create a free MongoDB Atlas cluster.

Create a database user.

Allow network access.

Copy your MongoDB connection string.

Example:

```
mongodb+srv://username:password@cluster.mongodb.net/campus_db
```

---

# 🔧 Backend Setup

```bash
cd backend

npm install
```

Create `.env`

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campus_db?retryWrites=true&w=majority

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=7d
```

Run Backend

```bash
npm run dev
```

or

```bash
npm start
```

Backend

```
http://localhost:5000
```

---

# 💻 Frontend Setup

```bash
cd frontend

npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

Run

```bash
npm run dev
```

Frontend

```
http://localhost:5173
```

---

# 🚀 Deployment

## Backend (Vercel)

Environment Variables

```
MONGO_URI

JWT_SECRET

JWT_EXPIRES_IN
```

## Frontend (Vercel)

Environment Variable

```
VITE_API_URL=https://your-backend.vercel.app/api
```

---

# 🔐 Roles

## Admin

- Manage Users
- Manage Clubs
- Manage Events
- View Analytics
- Send Announcements

## Coordinator

- Manage Own Events
- View Attendance
- Generate QR Codes

## Student

- Register Events
- Scan QR Attendance
- View Announcements

---

# 📡 API Routes

Authentication

```
POST /api/auth/register

POST /api/auth/login

GET /api/auth/me
```

Users

```
GET /api/users

GET /api/users/stats

PUT /api/users/:id/approve
```

Clubs

```
GET /api/clubs

POST /api/clubs

PUT /api/clubs/:id

DELETE /api/clubs/:id
```

Events

```
GET /api/events

GET /api/events/upcoming

GET /api/events/my

GET /api/events/analytics

POST /api/events

PUT /api/events/:id

DELETE /api/events/:id
```

Registrations

```
POST /api/registrations/register

DELETE /api/registrations/cancel

GET /api/registrations/my
```

Attendance

```
POST /api/attendance/scan

GET /api/attendance/event/:id

GET /api/attendance/my
```

Announcements

```
GET /api/announcements

POST /api/announcements
```

---

# 📱 QR Attendance Workflow

1. Coordinator creates an event.
2. QR Code is generated.
3. Student scans QR.
4. Backend validates registration.
5. Attendance is stored in MongoDB.

---

# 🔒 Security

- JWT Authentication
- Password Hashing (bcryptjs)
- Helmet
- Express Mongo Sanitize
- CORS Protection

---

# 👨‍💻 Author

**M. Tirupathi Naidu**

GitHub:
https://github.com/MTirupathiNaidu

---

# 📄 License

MIT License
