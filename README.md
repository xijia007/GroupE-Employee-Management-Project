# Employee Management System

A full-stack web application for managing employee onboarding, personal information, and visa status workflows. Built with React + Express + MongoDB.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Data Modeling](#4-data-modeling)
5. [Feature List](#5-feature-list)
6. [Work Contributions](#6-work-contributions)

---

## 1. Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| **React** | 19.2.0 | Core UI library (single-page application) |
| **Vite** | 7.2.4 | Build tool & dev server (fast HMR, ES module based) |
| **Ant Design (antd)** | 6.2.3 | UI component library (Form, Table, Card, Steps, Modal, Tags, etc.) |
| **@ant-design/icons** | 6.1.0 | Icon library for Ant Design |
| **React Router DOM** | 7.13.0 | Client-side routing (ProtectedRoute, role-based navigation) |
| **Redux Toolkit** | 2.11.2 | State management (auth state, user info, loading/error states) |
| **React Redux** | 9.2.0 | React bindings for Redux store |
| **Axios** | 1.13.4 | HTTP client (API calls with JWT interceptor for auto-attach token & auto-refresh) |
| **Day.js** | 1.11.19 | Lightweight date formatting and manipulation |
| **React Hook Form** | 7.71.1 | Form management (installed, Ant Design Form also used in some components) |

### Backend

| Library | Version | Purpose |
|---|---|---|
| **Express** | 5.2.1 | Node.js web framework (RESTful API) |
| **Mongoose** | 9.1.5 | MongoDB ODM (schema modeling, validation, queries) |
| **jsonwebtoken** | 9.0.3 | JWT authentication (Access Token 1h + Refresh Token 7d) |
| **bcryptjs** | 3.0.3 | Password hashing with salt |
| **Nodemailer** | 7.0.13 | Email service (registration invitations, status notifications, visa reminders) |
| **Multer** | 2.0.2 | File upload middleware (multipart/form-data, memory storage for GridFS) |
| **Zod** | 4.3.6 | Schema validation for API request bodies |
| **cookie-parser** | 1.4.7 | Parse cookies from request headers (refresh token in httpOnly cookie) |
| **cors** | 2.8.6 | Cross-origin resource sharing configuration |
| **dotenv** | 17.2.3 | Environment variable management (.env file loading) |
| **Nodemon** | 3.1.11 (dev) | Auto-restart server on file changes during development |

### External Services

| Service | Purpose |
|---|---|
| **MongoDB Atlas** (or local MongoDB) | Cloud/local NoSQL database |
| **Gmail SMTP** (via Nodemailer) | Email delivery for registration tokens, status notifications, visa reminders |

---

## 2. Frontend Architecture

```
frontend/src/
├── main.jsx                           # App entry point (React root, Redux Provider, BrowserRouter)
├── App.jsx                            # Root component: routing config, ProtectedRoute, ApprovedOnlyRoute, AppLayout
├── App.css                            # Global app styles
├── index.css                          # Base CSS styles
│
├── features/                          # Redux slices (state management)
│   └── auth/
│       └── authSlice.js               # Auth: loginUser, logoutUser, getAvatar, selectors
│
├── store/
│   └── store.js                       # Redux store configuration
│
├── services/                          # API communication layer
│   ├── api.js                         # Axios instance: base URL, JWT interceptor (auto-attach token, auto-refresh on 401)
│   └── hrService.js                   # HR-specific API calls (generateToken, getTokens, getApplications, getEmployees, etc.)
│
├── components/                        # Reusable UI components
│   ├── Header/
│   │   └── Header.jsx                 # Top navigation bar (logo, user avatar)
│   ├── Footer/
│   │   └── Footer.jsx                 # Footer component
│   ├── Sider/
│   │   └── Sider_component.jsx        # Sidebar navigation (role-based: different menus for Employee vs HR)
│   └── form/
│       ├── onboarding_form.jsx        # Onboarding application form (all fields, conditional visa logic, file uploads)
│       ├── Information_form.jsx       # Personal Information form (section-based Edit/Save/Cancel per section)
│       ├── Visa_StatusForm_.jsx       # Employee Visa Status (4-step OPT flow: Receipt → EAD → I-983 → I-20)
│       ├── Hr_Visa_Status.jsx         # HR Visa Status view (In Progress / All tabs, approve/reject, send reminders)
│       └── section/                   # Personal Information sub-sections
│           ├── nameSection.jsx        # Name, email, SSN, DOB, gender, profile picture
│           ├── addressSection.jsx     # Building/apt, street, city, state, zip
│           ├── contactSection.jsx     # Cell phone, work phone
│           ├── visaInformationSection.jsx  # Visa type, start date, end date
│           ├── EmergencySection.jsx   # Emergency contacts (dynamic add/remove)
│           ├── uploadDocument.jsx     # Documents display (driver license, work auth, other)
│           └── SectionButton.jsx      # Reusable Edit / Save / Cancel button group
│
├── pages/                             # Route-level page components
│   ├── auth/
│   │   ├── Login.jsx                  # Login page (shared by Employee & HR, role-based redirect)
│   │   └── Register.jsx              # Registration page (token-based, email pre-filled from token)
│   ├── Home.jsx                       # Dashboard (role-based: HR stats vs Employee onboarding alerts)
│   ├── Onboarding_application.jsx     # Onboarding page (status steps + form or read-only view)
│   ├── Person_information.jsx         # Personal Information page wrapper
│   ├── Visa_status.jsx                # Employee Visa Status page wrapper
│   ├── Dashborad.jsx                  # Dashboard placeholder
│   ├── Person_Application.jsx         # Person Application placeholder
│   └── hr/
│       ├── HiringManagement.jsx       # HR: Token generation + Application review (Pending/Rejected/Approved tabs)
│       ├── EmployeeProfiles.jsx       # HR: Employee summary table (search, sort by last name, click → new tab)
│       ├── EmployeeDetail.jsx         # HR: Full employee profile (opened in new tab)
│       ├── ApplicationReview.jsx      # HR: View & approve/reject onboarding application (new tab)
│       └── HR_VisaStatus.jsx          # HR: Visa Status Management page wrapper
│
└── assets/
    └── react.svg                      # React logo asset
```

### Key Frontend Design Patterns

| Pattern | Description |
|---|---|
| **ProtectedRoute** | Route guard that redirects unauthenticated users to `/login`; supports `requiredRole` prop for HR-only routes |
| **ApprovedOnlyRoute** | Ensures employees can only access Personal Info & Visa Status pages after onboarding is approved |
| **Role-based Navigation** | Sider component dynamically renders Employee or HR menu items based on `user.role` |
| **Section-based Editing** | Personal Info page uses independent Edit/Cancel/Save per section (not a single form submit) |
| **JWT Interceptor** | `api.js` Axios instance auto-attaches Bearer token to all requests and handles 401 token refresh |

---

## 3. Backend Architecture

```
backend/
├── server.js                          # Express app entry: middleware setup, route mounting, error handlers, DB connect
├── package.json                       # Dependencies & scripts (dev / start)
├── .env                               # Environment variables (DB_URI, JWT secrets, email credentials, FRONTEND_URL)
│
├── config/
│   └── db.js                          # MongoDB connection using mongoose.connect()
│
├── models/                            # Mongoose schemas (data layer)
│   ├── User.js                        # User: username, email, password (hashed), role (Employee/HR), onboardingStatus
│   ├── RegistrationToken.js           # Token: token string, email, name, status (Sent/Submitted), expiresAt (3h)
│   ├── OnboardingApplication.js       # Application: full onboarding form data, documents (GridFS paths), status, feedback
│   └── Profile.js                     # Profile: approved employee data, visa document statuses (OPT tracking)
│
├── controllers/                       # Business logic (request handlers)
│   ├── authController.js              # validateToken, register (with email uniqueness), login, refreshToken, logout
│   ├── onboardingController.js        # submitApplication, getMyApplication, getStatus, deleteApplication
│   ├── hrController.js                # generateToken, getAllTokens, getAllApplications, getApplicationById,
│   │                                  # reviewApplication (approve → create Profile), getAllEmployees,
│   │                                  # getEmployeeById, getVisaStatusList, reviewVisaDocument, sendVisaStatusReminder
│   ├── ProfileController.js           # getUserProfile (with self-healing from approved app), updateProfile, uploadDocument
│   └── fileController.js              # streamFile: GridFS file streaming with user role & ownership access control
│
├── routes/                            # Express route definitions
│   ├── authRoutes.js                  # POST /api/auth/register, /login, /refresh, /logout; GET /validate-token/:token
│   ├── onboardingRoutes.js            # POST /api/onboarding/submit; GET /my-application, /status; DELETE /:id
│   ├── hrRoutes.js                    # /api/hr/generate-token, /tokens, /applications, /employees, /visa-status, etc.
│   ├── InfoRoutes.js                  # GET/PUT /api/info/profile; POST /api/info/profile/upload-document
│   └── fileRoutes.js                  # GET /api/files/:fileId (streaming download/preview)
│
├── middleware/                        # Express middleware
│   ├── authMiddleware.js              # verifyToken (JWT validation, sets req.userId & req.userRole) + requireHR (role guard)
│   ├── uploadMiddleware.js            # Multer config (memory storage for GridFS, file size & type limits)
│   └── validationMiddleware.js        # Zod validation middleware: validateRequest(schema) → 400 with field-level errors
│
├── schemas/
│   └── zodSchemas.js                  # Zod schemas: loginSchema, registerSchema, generateTokenSchema, reviewSchema, etc.
│
├── utils/                             # Utility functions
│   ├── emailService.js                # Nodemailer: sendRegistrationEmail, sendApplicationStatusEmail, sendVisaStatusReminderEmail
│   ├── gridfs.js                      # GridFS helpers: uploadBufferToGridFS, findFileById, openDownloadStream
│   └── statusUtils.js                 # normalizeStatusKey, normalizeStatusValue (handle case-insensitive status matching)
│
└── scripts/                           # One-off utility scripts
    ├── hashPassword.js                # Hash a password for seeding HR accounts
    └── migrateTokenExpires.js         # Migration: add expiresAt field to existing tokens
```

### Key Backend Design Patterns

| Pattern | Description |
|---|---|
| **MVC Architecture** | Models → Controllers → Routes separation of concerns |
| **JWT Dual-Token** | Access Token (1h, sent in Authorization header) + Refresh Token (7d, httpOnly cookie) |
| **Middleware Chain** | `verifyToken → requireHR → validateRequest(zodSchema) → controller` |
| **GridFS File Storage** | Large files (PDFs, images) stored in MongoDB GridFS with streaming download |
| **Self-Healing Profile** | If profile is missing but onboarding is approved, auto-creates profile from application data |
| **Non-Blocking Email** | Email sending never blocks main operations (try/catch with continue-on-failure) |
| **E11000 Safety Net** | Handles MongoDB duplicate key errors gracefully (for concurrent requests on unique fields) |

---

## 4. Data Modeling

### 4.1 Models & Relationships

```
┌──────────────────┐     1:1      ┌─────────────────────────┐
│      User        │─────────────▶│  OnboardingApplication  │
│                  │   (userId)   │                         │
│  _id             │              │  userId (ref: User)     │
│  username ★      │              │  firstName, lastName    │
│  email ★         │              │  middleName, preferred  │
│  password (hash) │              │  currentAddress {}      │
│  role (Employee/ │              │  cellPhone, workPhone   │
│        HR)       │              │  ssn, dateOfBirth       │
│  onboardingStatus│              │  gender                 │
│                  │              │  usResident, visaTitle   │
└──────────────────┘              │  visaStartDate/EndDate  │
        │                         │  emergencyContacts []   │
        │                         │  reference {}           │
        │                         │  documents {}           │
        │ 1:1                     │  status (Pending/       │
        │ (user ref)              │    Approved/Rejected)   │
        ▼                         │  feedback               │
┌──────────────────────────┐      │  reviewedBy, reviewedAt │
│        Profile           │      └─────────────────────────┘
│  (Created on Approval)   │
│                          │
│  user (ref: User) ★      │
│  firstName, lastName     │
│  address {}              │      ┌─────────────────────────┐
│  contactInfo {}          │      │   RegistrationToken     │
│  visaInformation {}      │      │                         │
│  emergencyContacts []    │      │  token ★ (64-char hex)  │
│  documents {}            │      │  email                  │
│  visaDocuments {         │      │  name                   │
│    optReceipt  {status}  │      │  status (Sent/Submitted)│
│    optEad      {status}  │      │  expiresAt (3 hours)    │
│    i983        {status}  │      │  createdAt              │
│    i20         {status}  │      └─────────────────────────┘
│  }                       │
└──────────────────────────┘

★ = unique index
```

### 4.2 Relationships Summary

| Relationship | Type | How It Works |
|---|---|---|
| **User → OnboardingApplication** | 1:1 | Each employee submits at most one onboarding application (`userId` ref) |
| **User → Profile** | 1:1 | Each approved employee has one profile (`user` ref), created from approved app data |
| **RegistrationToken → User** | 1:1 | Each token is used to register one user (linked by `email`) |
| **OnboardingApplication → Profile** | Data Flow | When HR approves application, data is copied to create/update a Profile |

### 4.3 Status Flow Diagrams

**Registration & Onboarding:**
```
RegistrationToken:  [ Sent ] ──(employee registers)──▶ [ Submitted ]

OnboardingStatus:   [ Never Submitted ] ──(submit form)──▶ [ Pending ] ──(HR approves)──▶ [ Approved ] → Profile Created
                                                                        └──(HR rejects)──▶ [ Rejected ] ──(edit & resubmit)──▶ [ Pending ]
```

**Visa Document OPT Pipeline (for F1 students):**
```
OPT Receipt: [ Not Uploaded ] → Upload → [ Pending ] → HR Approve → [ Approved ] ──▶ unlocks OPT EAD
                                                      → HR Reject  → [ Rejected ] → Re-upload

OPT EAD:    [ Locked ] → (Receipt approved) → [ Not Uploaded ] → Upload → [ Pending ] → Approve/Reject → ...

I-983:      [ Locked ] → (EAD approved) → [ Not Uploaded ] → Download templates → Upload → [ Pending ] → ...

I-20:       [ Locked ] → (I-983 approved) → [ Not Uploaded ] → Upload → [ Pending ] → Approve → ✅ All Done!
```

---

## 5. Feature List

### ✅ Implemented Features

#### Employee Side

| Feature | Description |
|---|---|
| **Registration** | Token-based registration (email pre-filled from HR token, unique username + email validation, bcrypt password hashing) |
| **Login/Logout** | JWT authentication with dual-token (access + refresh), role-based redirect, session persistence on refresh |
| **Onboarding Application** | Full form with conditional logic (visa type → different fields), file uploads (OPT Receipt, driver license, work auth), 3-status workflow (Pending/Approved/Rejected with HR feedback) |
| **Personal Information** | Section-based editing (Name, Address, Contact, Visa, Emergency, Documents), each section has independent Edit/Save/Cancel |
| **Visa Status Management** | 4-stage OPT document pipeline (Receipt → EAD → I-983 → I-20), sequential unlocking, status messages, HR feedback display |

#### HR Side

| Feature | Description |
|---|---|
| **Hiring Management - Tokens** | Generate registration tokens, send invitation emails, token history with status tracking, 3-hour expiry |
| **Hiring Management - Review** | 3-tab application review (Pending/Rejected/Approved), view full application in new tab, approve/reject with feedback |
| **Employee Profiles** | Summary table (name, SSN masked, work auth, phone, email), alphabetical sort, real-time search, click name → full profile in new tab |
| **Visa Status - In Progress** | List F1 employees with incomplete OPT docs, show next steps, approve/reject documents, send email reminders |
| **Visa Status - All** | List all visa employees, search, view/download approved documents |
| **Home Dashboard** | Role-based dashboard with quick stats (pending apps, active employees) and alerts |

#### Backend / Infra

| Feature | Description |
|---|---|
| **JWT Dual-Token Auth** | Access Token (1h) + Refresh Token (7d, httpOnly cookie), auto-refresh on 401 |
| **GridFS File Storage** | Documents stored in MongoDB GridFS, streaming download with access control |
| **Email Service** | Nodemailer for registration invitations, application status notifications, visa reminders |
| **Zod Validation** | Request body validation with field-level error messages |
| **Self-Healing Profile** | Auto-creates profile from approved application if profile is missing |
| **Status Normalization** | Consistent status handling across different data sources |


## 6. Work Contributions

### Xi Jia — Authentication & Onboarding Pipeline
*Focus: Complete user lifecycle from registration → onboarding → approval*

#### Employee Side
- **Registration Page**: Token validation, registration form, unique username/email checks
- **Login Page**: JWT authentication (dual-token), session management, role-based redirect
- **Onboarding Application Page**: Complex form with conditional visa logic, file uploads, 3-status workflow

#### HR Side
- **Login Page**: Shared login with auto role detection
- **Hiring Management Page**: Token generation & email sending, registration history, application review (3 tabs), approve/reject with feedback
- **Employee Profiles Page**: Summary table, search, detailed profile view in new tab

#### Backend
- Auth APIs (register, login, token refresh, logout, token validation)
- Onboarding APIs (submit, update, get status, get my application)
- HR hiring APIs (generate token, send email, review applications)
- Employee profile APIs (list employees, search, get employee details)

---

### Zhenjia Li — Personal Information & Visa Document Management
*Focus: Employee data management + visa workflow automation*

#### Employee Side
- **Personal Information Page**: Multi-section editing (Name, Address, Contact, Employment, Emergency, Documents) with per-section Save/Cancel
- **Visa Status Management Page**: 4-stage OPT workflow (Receipt → EAD → I-983 → I-20), conditional rendering, document upload, HR feedback display

#### HR Side
- **Visa Status Management Page**: "In Progress" view (employees with incomplete workflows, next steps, approve/reject), "All" view (search, filter, download), reminder email functionality

#### Backend
- Personal info APIs (get profile, update by section)
- Visa document APIs (upload, get status, list by stage)
- HR visa management APIs (list employees, approve/reject documents, send notifications)
- File storage & retrieval (GridFS upload, streaming download/preview with access control)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Gmail account for SMTP (or other email service)

### Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:xijia007/GroupE-Employee-Management-Project.git
   cd Employee-Management-Project
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/employee-management
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:5173
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001/api`

### Default HR Account
- Username: `hr_admin_1`
- Password: `HRAdmin123!`
