# 🎓 Smart Campus Event & Club Management System

A full-stack web application for managing campus events, clubs, and attendance.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT + bcrypt |
| QR Codes | qrcode.react + html5-qrcode |
| Charts | Chart.js + react-chartjs-2 |

---

## Prerequisites

- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **MySQL** 8+ running locally
- **npm** (comes with Node.js)

---

## Database Setup

1. Start MySQL and create the database:
```sql
CREATE DATABASE campus_db;
```

2. Import the schema:
```bash
mysql -u root -p campus_db < e:\campus\backend\schema.sql
```

---

## Backend Setup

```bash
cd e:\campus\backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

Edit `e:\campus\backend\.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_db
JWT_SECRET=any_long_random_string_here
JWT_EXPIRES_IN=7d
```

Start the backend:
```bash
npm run dev        # development (with nodemon)
# or
npm start          # production
```

Backend runs at: `http://localhost:5000`

---

## Frontend Setup

```bash
cd e:\campus\frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

Edit `e:\campus\frontend\.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Sample Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campus.edu | Admin@123 |

> **Note:** The admin password in `schema.sql` uses a bcrypt hash. If login fails, generate a fresh hash:
> ```bash
> node -e "const b=require('bcryptjs'); console.log(b.hashSync('Admin@123',10))"
> ```
> Then update the users table manually.

---

## Role Permissions

| Feature | Admin | Coordinator | Student |
|---------|-------|-------------|---------|
| Create/Edit/Delete Events | ✅ | ✅ (own) | ❌ |
| Create/Manage Clubs | ✅ | ❌ | ❌ |
| Approve Coordinators | ✅ | ❌ | ❌ |
| View All Users | ✅ | ❌ | ❌ |
| Send Announcements | ✅ | ❌ | ❌ |
| View QR Codes | ❌ | ✅ | ❌ |
| Scan QR for Attendance | ❌ | ❌ | ✅ |
| Register for Events | ❌ | ❌ | ✅ |
| View Analytics | ✅ | ✅ (own) | ❌ |

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users         (admin)
GET    /api/users/stats   (admin)
PUT    /api/users/:id/approve (admin)

GET    /api/clubs
POST   /api/clubs         (admin)
PUT    /api/clubs/:id     (admin)
DELETE /api/clubs/:id     (admin)

GET    /api/events
GET    /api/events/upcoming
GET    /api/events/my     (coordinator)
GET    /api/events/analytics (admin)
POST   /api/events        (admin/coordinator)
PUT    /api/events/:id
DELETE /api/events/:id

POST   /api/registrations/register  (student)
DELETE /api/registrations/cancel    (student)
GET    /api/registrations/my        (student)

POST   /api/attendance/scan         (student - QR)
GET    /api/attendance/event/:id    (coordinator/admin)
GET    /api/attendance/my           (student)

GET    /api/announcements
POST   /api/announcements  (admin)
```

---

## Project Structure

```
e:\campus\
├── backend\
│   ├── config\db.js
│   ├── controllers\
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── clubController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   └── attendanceController.js
│   ├── middleware\auth.js
│   ├── routes\
│   │   ├── auth.js, users.js, clubs.js
│   │   ├── events.js, registrations.js
│   │   └── attendance.js
│   ├── schema.sql
│   ├── server.js
│   └── .env
│
└── frontend\
    └── src\
        ├── context\AuthContext.jsx
        ├── services\api.js
        ├── components\
        │   ├── Sidebar.jsx
        │   ├── Modal.jsx
        │   ├── EventCard.jsx
        │   └── ProtectedRoute.jsx
        ├── pages\
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── AdminDashboard.jsx
        │   ├── CoordinatorDashboard.jsx
        │   ├── StudentDashboard.jsx
        │   └── PendingApproval.jsx
        └── App.jsx
```

---

## QR Attendance Flow

1. **Coordinator** creates event → unique 64-char hex `qr_token` is auto-generated
2. **Coordinator** displays the QR code (from dashboard) at the event
3. **Student** opens the "Scan QR" tab and scans with phone camera
4. Backend validates the token, checks registration, prevents duplicates
5. Attendance is saved with `status = 'present'`

---

## Troubleshooting

- **CORS errors:** Ensure backend is running on port 5000 and VITE_API_URL is correct
- **DB connection:** Check `.env` DB credentials and that MySQL service is running
- **Admin login fails:** Re-generate the bcrypt hash (see Sample Credentials above)
- **QR scanner not working:** App requires HTTPS or localhost for camera access
