# Veezta Frontend — Doctor-Patient Reservation System

A production-ready React + TypeScript frontend for the **Veezta** healthcare booking platform, wired to your .NET Core backend.

---

## Tech Stack

| Concern | Library |
|---------|---------|
| Language | TypeScript (strict) |
| Framework | React 18 |
| Routing | React Router v6 |
| Styling | Bootstrap 5 + Bootstrap Icons |
| HTTP | Axios (JWT in memory) |
| Build | Vite |

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env` and set your backend URL:
```env
VITE_API_BASE_URL=https://localhost:5001
```

### 3. Run development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## Project Structure

```
src/
├── api/
│   ├── axiosClient.ts       # Axios + JWT interceptor
│   ├── admin.api.ts         # Admin API calls
│   ├── doctor.api.ts        # Doctor API calls
│   ├── patient.api.ts       # Patient API calls
│   └── coupon.api.ts        # Coupon API calls
├── context/
│   └── AuthContext.tsx      # Global auth (token in memory)
├── components/
│   ├── Navbar/              # Top navigation bar
│   ├── ProtectedRoute.tsx   # Role-based route guard
│   └── LoadingSpinner/      # Loading indicator
├── models/
│   └── index.ts             # All TypeScript interfaces (matches backend DTOs)
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx    # Login with role selector dropdown
│   │   └── RegisterPage.tsx # Patient registration
│   ├── admin/
│   │   └── AdminDashboard.tsx
│   │       ├── Overview     # Stats, top doctors, top specializations
│   │       ├── Doctors      # Paginated list + Add Doctor form
│   │       ├── Patients     # Paginated patient list
│   │       └── Coupons      # Create/manage coupons
│   ├── doctor/
│   │   └── DoctorDashboard.tsx
│   │       ├── Overview     # Today's appointments + stats
│   │       ├── Appointments # All patient bookings + confirm checkup
│   │       └── Schedule     # Add time slots (day + time range)
│   └── patient/
│       └── PatientDashboard.tsx
│           ├── Overview     # Stats + promo codes + recent bookings
│           ├── Find Doctors # Browse doctors + book with promo code
│           └── My Bookings  # View all bookings by status + cancel
├── styles/
│   └── global.css
├── App.tsx
└── main.tsx
```

---

## API Endpoints Used

### Auth (role-based login)
| Role | Endpoint |
|------|----------|
| Admin | `POST /api/Doctor/Login` |
| Doctor | `POST /api/Doctor/Login` |
| Patient | `POST /api/Patient/Login` |

### Admin
| Action | Method | Endpoint |
|--------|--------|----------|
| Add doctor | POST | `/api/Admin/AddDoctor` |
| Get all doctors | GET | `/api/Admin/GetAllDoctors` |
| Delete doctor | DELETE | `/api/Admin/DeleteDoctorById/{id}` |
| Get all patients | GET | `/api/Admin/GetAllPatients` |
| Top specializations | GET | `/api/Admin/TopFiveSpecializations` |
| Top doctors | GET | `/api/Admin/TopTenDoctors` |
| Request stats | GET | `/api/Admin/GetNumberOfRequests` |
| Doctor count | GET | `/api/Admin/NumOfDoctors` |
| Patient count | GET | `/api/Admin/TotalNumberOfPatients` |
| Doctors last 24h | GET | `/api/Admin/NumOfDoctorsInTheLast24Hours` |

### Doctor
| Action | Method | Endpoint |
|--------|--------|----------|
| My appointments | GET | `/api/Doctor/GetMyAppointments` |
| Add appointment slots | POST | `/api/Doctor/AddAppointment` |
| Delete slot | DELETE | `/api/Doctor/DeleteAppointment/{id}` |
| Confirm checkup | POST | `/api/Doctor/ConfirmCheckup/{bookingId}` |

### Patient
| Action | Method | Endpoint |
|--------|--------|----------|
| Register | POST | `/api/Patient/Register` |
| Get doctor appointments | GET | `/api/Patient/GetDoctorAppointments` |
| Book appointment | POST | `/api/Patient/BookAppointment` |
| Cancel booking | DELETE | `/api/Patient/CancelAppointment/{id}` |
| My bookings | GET | `/api/Patient/MyBookings` |

---

## Backend CORS Config (add to Program.cs)

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("ReactApp", policy => {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
app.UseCors("ReactApp");
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | Admin@123 |
| Doctor | dr.smith@hospital.com | Doctor@123 |
| Patient | john@email.com | Patient@123 |

> Update these to match your actual seeded credentials from `DataSeeder.cs`.

---

## Security Notes

- JWT token stored **in memory only** (never localStorage)
- `axios` interceptor automatically attaches `Bearer` token to all requests
- `ProtectedRoute` guards all dashboard routes by role
- Patient ID on bookings derived from **JWT claims server-side** (not client-sent)
