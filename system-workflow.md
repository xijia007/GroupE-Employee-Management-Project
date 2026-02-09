# 📋 Employee Management System - Complete System Workflow Documentation

> **Project**: Employee Management System  
> **Team**: Group E

---

## 📑 Table of Contents

- [System Architecture Overview](#system-architecture-overview)
- [Phase 1: User Registration & Authentication Flow](#phase-1-user-registration--authentication-flow)
- [Phase 2: Employee Onboarding Application Flow](#phase-2-employee-onboarding-application-flow)
- [Phase 3: HR Review Process](#phase-3-hr-review-process)
- [Phase 4: Personal Information Management Flow](#phase-4-personal-information-management-flow)
- [Phase 5: Visa Status Management Flow](#phase-5-visa-status-management-flow)
- [Complete Data Flow Architecture](#complete-data-flow-architecture)
- [Technology Stack Overview](#technology-stack-overview)
- [API Endpoints Summary](#api-endpoints-summary)

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMPLOYEE MANAGEMENT SYSTEM                    │
│                                                                  │
│  ┌─────────────┐        ┌──────────┐        ┌──────────────┐   │
│  │  HR Portal  │  ←→    │  Backend │   ←→   │ Employee     │   │
│  │             │        │  Server  │        │ Portal       │   │
│  │ • Gen Token │        │  Express │        │ • Register   │   │
│  │ • Review    │        │  MongoDB │        │ • Apply      │   │
│  │ • Manage    │        │  JWT     │        │ • Manage     │   │
│  └─────────────┘        └──────────┘        └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Core Functional Modules

| Module | Feature | User Role |
|--------|---------|-----------|
| **Authentication** | Register, Login, Token Management | All |
| **Onboarding** | Employee Application Submit & Review | Employee + HR |
| **Profile Management** | Edit & Manage Personal Information | Employee |
| **Visa Management** | Upload & Review Visa Docs (4 Stages) | Employee + HR |
| **HR Dashboard** | Employee Management, Application Review, Visa Tracking | HR Only |

---

## 🎯 Phase 1: User Registration & Authentication Flow

### Process Overview

HR generates token → Send email → Employee registers → Employee logs in

### Detailed Flowchart

```
HR Side                         Backend                    Employee Side
────────────                    ───────                    ─────────────

1. HR logs in
   ↓
2. Generate registration token
   POST /api/hr/generate-token
   {
     email: "john@example.com",
     name: "John Doe"
   }
   ↓
   ┌──────────────────────────┐
   │ Database:                │
   │ RegistrationToken        │
   │ ┌─────────────────────┐ │
   │ │ token: "abc123..."  │ │
   │ │ email: "john@..."   │ │
   │ │ name: "John Doe"    │ │
   │ │ status: "Sent"      │ │
   │ │ expires: 3 days     │ │
   │ └─────────────────────┘ │
   └──────────────────────────┘
   ↓
3. Send email
   📧 Email Service
   Subject: "Welcome to Company"
   Link: http://localhost:5173/register?token=abc123
                                                           ↓
                                                    4. Employee receives email
                                                       Clicks registration link
                                                           ↓
                                                    5. Frontend validates token
                                                       GET /api/auth/registration-token/abc123
                                                       ← { email: "john@...", name: "John Doe" }
                                                           ↓
                                                    6. Fill registration form
                                                       ┌─────────────────┐
                                                       │ Email: (pre-filled)|
                                                       │ Name: (pre-filled) |
                                                       │ Username: ___    │
                                                       │ Password: ___    │
                                                       └─────────────────┘
                                                           ↓
                                                    7. Submit registration
                                                       POST /api/auth/register
                                                       {
                                                         token: "abc123",
                                                         username: "johndoe",
                                                         password: "SecurePass123"
                                                       }
   ┌──────────────────────────┐ ← ──────────────── ↓
   │ Database Updates:        │                    Backend processes:
   │                          │                    - Validate token
   │ User (create new)        │                    - Hash password
   │ ┌─────────────────────┐ │                    - Create user
   │ │ username: "johndoe" │ │                    - Mark token as "Submitted"
   │ │ password: (hashed)  │ │
   │ │ role: "Employee"    │ │
   │ │ onboardingStatus:   │ │
   │ │   "Never Submitted" │ │
   │ └─────────────────────┘ │
   │                          │
   │ RegistrationToken (update)|
   │ ┌─────────────────────┐ │
   │ │ status: "Submitted" │ │
   │ └─────────────────────┘ │
   └──────────────────────────┘
                                                           ↓
                                                    8. Registration successful
                                                       Auto redirect to login
                                                           ↓
                                                    9. User logs in
                                                       POST /api/auth/login
                                                       {
                                                         username: "johndoe",
                                                         password: "SecurePass123"
                                                       }
                                                           ↓
                                                    10. Receive JWT Token
                                                        {
                                                          accessToken: "eyJhbG...",
                                                          refreshToken: "eyJhbG...",
                                                          user: {
                                                            id: "...",
                                                            username: "johndoe",
                                                            role: "Employee",
                                                            onboardingStatus: "Never Submitted"
                                                          }
                                                        }
                                                           ↓
                                                    11. Save to localStorage
                                                        - accessToken
                                                        - refreshToken
                                                        - user
                                                           ↓
                                                    12. Navigate to Dashboard
```

### Key API Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| POST | `/api/hr/generate-token` | Generate registration token | HR Only |
| GET | `/api/auth/registration-token/:token` | Validate token | Public |
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/refresh` | Refresh Access Token | Authenticated |

### Database Changes

**RegistrationToken Collection:**
- `status`: `"Sent"` → `"Submitted"`

**User Collection (new):**
```json
{
  "username": "johndoe",
  "password": "$2b$10$...", // bcrypt hashed
  "email": "john@example.com",
  "role": "Employee",
  "onboardingStatus": "Never Submitted",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

## 🎯 Phase 2: Employee Onboarding Application Flow

### Process Overview

Employee logs in → View status → Fill form → Upload files → Submit application → Status becomes Pending

### Detailed Flowchart

```
Employee Side                   Backend                    Database
─────────────                   ───────                    ────────

1. Employee logs in and sees
   onboardingStatus: "Never Submitted"
   ↓
2. Clicks "Complete Onboarding"
   Navigate to /onboarding page
   ↓
3. Page loads, check status
   GET /api/onboarding/status
   ↓                                  Authorization: Bearer <token>
                                      ↓
                                   Verify JWT
                                   Extract userId
                                      ↓
                                   Query database
                                   OnboardingApplication.findOne({ userId })
                                      ↓                           ↓
                                   Not found               Found record
                                      ↓                           ↓
   ← 200 OK                        { status:             { status: "Pending",
   { status: "Never Submitted" }     "Never Submitted" }   feedback: "..." }
   ↓
4. Display empty form
   ┌──────────────────────────────────────┐
   │ Onboarding Application Form          │
   ├──────────────────────────────────────┤
   │ Personal Information:                 │
   │ • First Name: ___                     │
   │ • Last Name: ___                      │
   │ • Email: ___                          │
   │ • SSN: ___                            │
   │ • Date of Birth: ___                  │
   │ • Gender: ___                         │
   │                                       │
   │ Current Address:                      │
   │ • Building: ___                       │
   │ • Street: ___                         │
   │ • City: ___  State: ___  Zip: ___    │
   │                                       │
   │ Contact Information:                  │
   │ • Cell Phone: ___                     │
   │ • Work Phone: ___                     │
   │                                       │
   │ Work Authorization:                   │
   │ • Visa Type: [ H1-B / L2 / F1 / ... ]│
   │ • Start Date: ___  End Date: ___     │
   │                                       │
   │ Emergency Contact:                    │
   │ • Name: ___                           │
   │ • Phone: ___                          │
   │ • Email: ___                          │
   │ • Relationship: ___                   │
   │                                       │
   │ Documents:                            │
   │ • Driver License: [Upload]            │
   │ • Work Authorization: [Upload]        │
   │                                       │
   │ [Submit Application]                  │
   └──────────────────────────────────────┘
   ↓
5. Employee fills form and uploads files
   ↓
6. Clicks "Submit"
   POST /api/onboarding/submit
   Content-Type: multipart/form-data
   ↓
   FormData {
     firstName: "John",
     lastName: "Doe",
     email: "john@example.com",
     ssn: "123-45-6789",
     dateOfBirth: "1990-01-01",
     gender: "Male",
     currentAddress: "{...}",
     cellPhone: "123-456-7890",
     visaTitle: "H1-B",
     visaStartDate: "2024-01-01",
     visaEndDate: "2027-01-01",
     emergencyContacts: "[{...}]",
     driverLicense: <File>,
     workAuthorization: <File>
   }
   ↓                                  Authorization: Bearer <token>
                                      ↓
                                   Verify JWT
                                   Extract userId
                                      ↓
                                   Multer processes file upload
                                      ↓
                                   Save files to /uploads/documents/
                                   Generate file path: "userId_timestamp_filename.pdf"
                                      ↓
                                   Query existing application
                                   OnboardingApplication.findOne({ userId })
                                      ↓                           ↓
                                   Not found                   Found record
                                   Create new                  Update existing
                                      ↓                           ↓
                                   new OnboardingApplication({    Object.assign(application, data)
                                     userId,                       application.status = 'Pending'
                                     ...formData,                  application.submittedAt = new Date()
                                     documents: {
                                       driverLicense: "path1",
                                       workAuthorization: "path2"
                                     },
                                     status: 'Pending',
                                     submittedAt: new Date()
                                   })
                                      ↓
                                   await application.save()
                                      ↓
                                   Update User table
                                   User.findByIdAndUpdate(userId, {
                                     onboardingStatus: 'Pending'
                                   })
                                      ↓
   ← 200 OK                        Return success response
   {
     message: "Application submitted successfully",
     application: { ... }
   }
   ↓
7. Display success message
   ✅ "Application submitted successfully!"
   ↓
8. Status updated to "Pending"
   Alert: "Application Status: Pending"
   ↓
9. Form becomes read-only
   (Waiting for HR review)
```

### Key API Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/onboarding/status` | Get application status | Employee |
| GET | `/api/onboarding/my-application` | Get complete application data | Employee |
| POST | `/api/onboarding/submit` | Submit/Update application | Employee |

### File Upload Handling

**Multer Configuration:**
- Storage path: `/uploads/documents/`
- File naming: `{userId}_{timestamp}_{originalname}`
- File limit: 5MB
- Allowed types: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.doc`, `.docx`

**Upload fields:**
```javascript
{
  name: 'driverLicense', maxCount: 1,
  name: 'workAuthorization', maxCount: 1,
  name: 'other', maxCount: 1
}
```

### Database Changes

**OnboardingApplication Collection (new):**
```json
{
  "userId": "user_id_123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "ssn": "123-45-6789",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "currentAddress": {
    "building": "123",
    "street": "Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "cellPhone": "123-456-7890",
  "visaTitle": "H1-B",
  "visaStartDate": "2024-01-01",
  "visaEndDate": "2027-01-01",
  "emergencyContacts": [
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "987-654-3210",
      "email": "jane@example.com",
      "relationship": "Spouse"
    }
  ],
  "documents": {
    "driverLicense": "/uploads/documents/user_id_123_1234567890_license.pdf",
    "workAuthorization": "/uploads/documents/user_id_123_1234567891_opt.pdf"
  },
  "status": "Pending",
  "submittedAt": "2024-01-15T10:00:00Z"
}
```

**User Collection update:**
```json
{
  "onboardingStatus": "Never Submitted" → "Pending"
}
```

---

## 🎯 Phase 3: HR Review Process

### Process Overview

HR views application list → View details → Review files → Approve/Reject → Send notification

### Detailed Flowchart

```
HR Side                        Backend                    Employee Side
────────                       ───────                    ─────────────

1. HR logs in
   (role: "HR")
   ↓
2. Navigate to "Hiring Management" page
   GET /api/hr/applications?status=Pending
   ↓
   Backend returns pending list
   ← [
       {
         id: "...",
         userId: "...",
         firstName: "John",
         lastName: "Doe",
         email: "john@example.com",
         submittedAt: "2024-01-15",
         status: "Pending"
       },
       ...
     ]
   ↓
3. HR views application list
   ┌────────────────────────────────────────┐
   │ Pending Applications                    │
   ├────────────────────────────────────────┤
   │ Name         Email         Submitted    │
   │ John Doe     john@...     2024-01-15   │ [View]
   │ Jane Smith   jane@...     2024-01-16   │ [View]
   └────────────────────────────────────────┘
   ↓
4. Click [View] to see details
   GET /api/hr/applications/:id
   ↓
   Backend returns complete application
   ← {
       firstName: "John",
       lastName: "Doe",
       email: "john@example.com",
       ssn: "XXX-XX-XXXX",  // partially hidden
       dateOfBirth: "1990-01-01",
       currentAddress: { ... },
       visaTitle: "H1-B",
       emergencyContacts: [ ... ],
       documents: {
         driverLicense: "/uploads/documents/xxx.pdf",
         workAuthorization: "/uploads/documents/yyy.pdf"
       },
       status: "Pending",
       submittedAt: "2024-01-15"
     }
   ↓
5. HR reviews application details
   - View personal information
   - Download and view files
     GET /uploads/documents/xxx.pdf
   - Verify information accuracy
   ↓
6. HR makes decision
   ┌────────┬────────┐
   │ Approve│ Reject │
   └────────┴────────┘
   ↓                    ↓
   Approve              Reject
   ↓                    ↓
   PATCH /api/hr/applications/:id
   {                    {
     status: "Approved",  status: "Rejected",
     feedback: "Welcome!" feedback: "Please resubmit SSN"
   }                    }
   ↓                    ↓
   Backend processes:   Backend processes:
   - Update OnboardingApplication
   - application.status = "Approved"
   - application.feedback = "Welcome!"
   - application.reviewedAt = new Date()
   - application.reviewedBy = hrUserId
   ↓                    ↓
   - Update User table
   - user.onboardingStatus = "Approved"
   ↓                    ↓
   - Send notification email
   📧 "Congratulations!" 📧 "Please review feedback"
   ↓                    ↓
   Return success       Return success
                                                    ↓
                                                Employee receives email
                                                    ↓
                                                Logs in to check status
                                                GET /api/onboarding/status
                                                    ↓
                                                { 
                                                  status: "Approved",
                                                  feedback: "Welcome!",
                                                  reviewedAt: "2024-01-16"
                                                }
                                                    ↓
                                                Display approval status
                                                ✅ Alert: "Application Approved"
```

### Key API Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/hr/applications` | Get application list (with filter) | HR Only |
| GET | `/api/hr/applications/:id` | Get application details | HR Only |
| PATCH | `/api/hr/applications/:id` | Update application status (approve/reject) | HR Only |
| GET | `/uploads/documents/:filename` | Download file | Authenticated |

### Database Changes

**OnboardingApplication update:**
```json
{
  "status": "Pending" → "Approved" / "Rejected",
  "feedback": "Welcome to the team!",
  "reviewedAt": "2024-01-16T14:30:00Z",
  "reviewedBy": "hr_user_id_456"
}
```

**User update:**
```json
{
  "onboardingStatus": "Pending" → "Approved" / "Rejected"
}
```

---

## 🎯 Phase 4: Personal Information Management Flow

### Process Overview

Employee views personal info → Edit a section → Save changes → View updates

### Detailed Flowchart

```
Employee (Approved)            Backend                    Database
───────────────────            ───────                    ────────

1. Employee logs in
   onboardingStatus: "Approved"
   ↓
2. Navigate to "Personal Information" page
   GET /api/profile/:userId
   ↓
   Backend returns personal info
   ← {
       personalInfo: { firstName, lastName, ... },
       address: { ... },
       contactInfo: { ... },
       employment: { ... },
       emergencyContacts: [ ... ],
       documents: [ ... ]
     }
   ↓
3. View personal information
   ┌──────────────────────────────────┐
   │ Personal Information              │
   ├──────────────────────────────────┤
   │ Name Section           [Edit]     │
   │ • John Doe                        │
   │                                   │
   │ Address Section        [Edit]     │
   │ • 123 Main St, New York, NY      │
   │                                   │
   │ Contact Section        [Edit]     │
   │ • 123-456-7890                    │
   │                                   │
   │ Documents Section                 │
   │ • Driver License       [Download] │
   │ • OPT Receipt         [Download] │
   └──────────────────────────────────┘
   ↓
4. Click [Edit] to edit a section
   (e.g.: Address Section)
   ↓
   Section becomes editable
   ┌──────────────────────────────────┐
   │ Address Section    [Save][Cancel] │
   │ Building: [123        ]            │
   │ Street:   [Main St    ]            │
   │ City:     [New York   ]            │
   │ State:    [NY         ]            │
   │ Zip:      [10001      ]            │
   └──────────────────────────────────┘
   ↓
5. After modifying, click [Save]
   PATCH /api/profile/:userId/address
   {
     building: "456",
     street: "Oak Ave",
     city: "Boston",
     state: "MA",
     zip: "02101"
   }
   ↓
   Backend updates data
   OnboardingApplication.findOneAndUpdate(
     { userId },
     { $set: { "currentAddress": newAddress } }
   )
   ↓
   ← 200 OK
   { message: "Address updated successfully" }
   ↓
6. Section returns to view mode
   Display updated address
```

### Editable Sections

| Section | Fields | API Endpoint |
|---------|--------|--------------|
| **Personal Info** | firstName, lastName, preferredName, DOB | `PATCH /api/profile/:userId/personal` |
| **Address** | building, street, city, state, zip | `PATCH /api/profile/:userId/address` |
| **Contact** | cellPhone, workPhone, email | `PATCH /api/profile/:userId/contact` |
| **Emergency Contact** | emergencyContacts array | `PATCH /api/profile/:userId/emergency` |

### Key API Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/profile/:userId` | Get complete personal info | Employee (Own) |
| PATCH | `/api/profile/:userId/:section` | Update a section | Employee (Own) |
| GET | `/api/profile/:userId/documents` | Get document list | Employee (Own) |
| GET | `/api/profile/documents/:fileId/download` | Download file | Employee (Own) |

---

## 🎯 Phase 5: Visa Status Management Flow

### Process Overview

Employee views visa stage → Upload files → HR reviews → Unlock next stage → Loop until complete

### Visa Management 4 Stages

```
┌─────────────────────────────────────────────────────────┐
│           F1 (CPT/OPT) Visa Management Workflow          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Stage 1: OPT Receipt                                    │
│  ↓  (Employee uploads → HR approves)                     │
│                                                          │
│  Stage 2: OPT EAD (Employment Authorization Document)    │
│  ↓  (Unlocked after Stage 1 approved)                    │
│                                                          │
│  Stage 3: I-983 (Training Plan)                          │
│  ↓  (Unlocked after Stage 2 approved)                    │
│                                                          │
│  Stage 4: I-20 (Copy)                                    │
│  ✅  (Unlocked after Stage 3 approved)                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Detailed Flowchart

```
Employee (F1 Visa)             Backend                    HR Side
──────────────────             ───────                    ────────

1. Employee navigates to "Visa Status" page
   GET /api/visa/my-status
   ↓
   Backend returns visa process status
   ← {
       visaType: "F1(CPT/OPT)",
       stages: [
         { name: "OPT Receipt", status: "Approved", ... },
         { name: "OPT EAD", status: "Pending", ... },
         { name: "I-983", status: "Not Started", ... },
         { name: "I-20", status: "Not Started", ... }
       ]
     }
   ↓
2. View 4 stages
   ┌──────────────────────────────────────┐
   │ Visa Status Management                │
   ├──────────────────────────────────────┤
   │ ✅ OPT Receipt - Approved             │
   │    Uploaded: 2024-01-15               │
   │    Approved: 2024-01-16               │
   │                                       │
   │ ⏳ OPT EAD - Pending                  │
   │    Uploaded: 2024-02-01               │
   │    Status: Waiting for HR review      │
   │                                       │
   │ 🔒 I-983 - Locked                     │
   │    Please complete OPT EAD first      │
   │                                       │
   │ 🔒 I-20 - Locked                      │
   │    Waiting for I-983 approval         │
   └──────────────────────────────────────┘
   ↓
3. OPT Receipt approved
   Can upload OPT EAD
   ↓
4. Upload OPT EAD file
   POST /api/visa/upload
   {
     stage: "OPT_EAD",
     file: <File>
   }
   ↓
   Backend processes upload
   - Save file
   - Create VisaDocument record
   - Send notification to HR
   ↓
   ← 200 OK
   { message: "Document uploaded, waiting for review" }
                                                         ↓
                                                    HR receives notification
                                                    View pending documents
                                                         ↓
                                                    HR reviews OPT EAD
                                                    PATCH /api/visa/review/:id
                                                    { status: "Approved" }
                                                         ↓
                                                    System auto-unlocks next stage
   ← Notification                                  (I-983)
   📧 "Your OPT EAD has been approved"
   ↓
5. Employee receives notification
   Refresh page
   ↓
6. I-983 stage unlocked
   Can continue uploading
   (Loop process until all 4 stages complete)
```

### Visa Stage Status

| Status | Description | Employee Action | HR Action |
|--------|-------------|-----------------|-----------|
| **Not Started** | Not started (locked) | Cannot upload | None |
| **Pending** | Uploaded, waiting for HR review | Can view | Can review |
| **Approved** | HR approved | Read-only | Read-only |
| **Rejected** | HR rejected, need reupload | Can reupload | Can re-review |

### Key API Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/visa/my-status` | Get visa status (4 stages) | Employee |
| POST | `/api/visa/upload` | Upload visa file | Employee |
| GET | `/api/visa/documents/:stage` | Get stage files | Employee |
| GET | `/api/hr/visa/in-progress` | Get all in-progress visas | HR Only |
| PATCH | `/api/hr/visa/review/:id` | Review visa file | HR Only |
| POST | `/api/hr/visa/send-notification/:id` | Send reminder email | HR Only |

### Database Changes

**VisaDocument Collection (new):**
```json
{
  "userId": "user_id_123",
  "stage": "OPT_EAD",
  "fileName": "opt_ead_card.pdf",
  "filePath": "/uploads/visa/user_id_123_1234567890_opt_ead.pdf",
  "uploadedAt": "2024-02-01T10:00:00Z",
  "status": "Pending",
  "reviewedBy": null,
  "reviewedAt": null,
  "feedback": null
}
```

---

## 📊 Complete Data Flow Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        COMPLETE DATA FLOW                           │
└────────────────────────────────────────────────────────────────────┘

Frontend                 API Gateway              Backend              Database
────────                 ───────────              ───────              ────────

Browser                  Express Server           Controllers          MongoDB
  ↓                           ↓                         ↓                 ↓
React App                 Middleware                Business Logic      Collections
  ↓                           ↓                         ↓                 ↓
┌──────────┐             ┌──────────┐             ┌──────────┐       ┌──────────┐
│Components│             │   CORS   │             │  auth    │       │  users   │
│  Pages   │             │   JSON   │             │onboarding│       │  tokens  │
│ Services │             │   JWT    │             │  profile │       │onboarding│
│  Redux   │             │  Multer  │             │   visa   │       │   visa   │
└──────────┘             └──────────┘             └──────────┘       └──────────┘
     ↓                        ↓                         ↓                 ↓
HTTP Requests            Route Matching            Database Queries   Data Storage
     ↓                        ↓                         ↓                 ↓
GET /api/...      →      authRoutes.js      →      User.find()     →   [Docs]
POST /api/...     →      onboardingRoutes   →      App.save()      →   [Save]
PATCH /api/...    →      profileRoutes      →      Model.update()  →   [Update]
     ↓                        ↓                         ↓                 ↓
Responses         ←      JSON Response      ←      Return Data     ←   Results
     ↓
Update UI
Display to User
```

### Request/Response Flow Example

**Example: Submit Onboarding Application**

```
1. Frontend (React)
   ↓
   onFinish(formData)
   ↓
   submitOnboardingApplication(formData)  // Service
   ↓
   axios.post('/api/onboarding/submit', formData)
   ↓
2. API Layer (Express)
   ↓
   app.use('/api/onboarding', onboardingRoutes)
   ↓
   router.post('/submit', verifyToken, uploadMultiple, submitApplication)
   ↓
   Middleware Chain:
   - verifyToken: Verify JWT, extract userId
   - uploadMultiple: Multer handles file upload
   - submitApplication: Business logic
   ↓
3. Backend (Controller)
   ↓
   submitApplication(req, res)
   ↓
   - Parse req.body and req.files
   - Validate data
   - Save file paths
   ↓
4. Database (MongoDB)
   ↓
   OnboardingApplication.create({ ... })
   User.findByIdAndUpdate({ ... })
   ↓
   Return saved document
   ↓
5. Response returns
   ↓
   res.status(200).json({ message: "Success", application })
   ↓
6. Frontend receives
   ↓
   .then(data => { message.success(...) })
   ↓
   Update UI state
```

---

## 🛠️ Technology Stack Overview

### Frontend Tech Stack

```
┌──────────────────────────────────────────────────────────┐
│ React Application                                         │
├──────────────────────────────────────────────────────────┤
│ • React: 19.2.0                                           │
│   - Hooks (useState, useEffect, useContext)               │
│   - Component-based architecture                          │
│                                                           │
│ • Ant Design: 6.2.3                                       │
│   - Form, Table, Modal, Alert, Steps, Upload             │
│   - Design system & theming                               │
│                                                           │
│ • React Router: 7.13.0                                    │
│   - Client-side routing                                   │
│   - Protected routes                                      │
│                                                           │
│ • HTTP Client                                             │
│   - Axios: HTTP requests                                  │
│   - Request/Response interceptors                         │
│   - Automatic token refresh                               │
│                                                           │
│ • Form Management                                         │
│   - React Hook Form: Form validation                      │
│   - Integration with Ant Design                           │
│                                                           │
│ • Utilities                                               │
│   - Dayjs: Date handling                                  │
│   - @ant-design/icons: Icon library                       │
│                                                           │
│ • Build Tools                                             │
│   - Vite: Build tool & dev server                         │
│   - ESLint: Code quality                                  │
└──────────────────────────────────────────────────────────┘
```

### Backend Tech Stack

```
┌──────────────────────────────────────────────────────────┐
│ Node.js + Express Application                             │
├──────────────────────────────────────────────────────────┤
│ • Express: 5.2.1                                          │
│   - RESTful API framework                                 │
│   - Middleware architecture                               │
│                                                           │
│ • Database                                                │
│   - MongoDB: NoSQL database                               │
│   - Mongoose: 9.1.5 (ODM)                                 │
│   - Schema validation                                     │
│                                                           │  
│ • Authentication                                          │
│   - JWT: jsonwebtoken 9.0.3                               │
│   - Bcrypt: Password hashing                              │
│   - Access token + Refresh token                          │
│                                                           │
│ • File Upload                                             │
│   - Multer: 2.0.2                                         │
│   - File validation & storage                             │
│                                                           │
│ • Email Service                                           │
│   - Nodemailer: 7.0.13                                    │
│   - SMTP integration                                      │
│                                                           │
│ • Configuration                                           │
│   - Dotenv: Environment variables                         │
│   - CORS: Cross-origin support                            │
│                                                           │
│ • Development                                             │
│   - Nodemon: Auto-restart on changes                      │
└──────────────────────────────────────────────────────────┘
```

### Database Schema

```
MongoDB Collections:

1. users
   - _id, username, password (hashed), email
   - role, onboardingStatus, createdAt

2. registrationtokens
   - _id, token, email, name
   - status, expiresAt, createdAt

3. onboardingapplications
   - _id, userId, firstName, lastName, email, ssn
   - dateOfBirth, gender, currentAddress
   - cellPhone, visaTitle, emergencyContacts
   - documents, status, feedback
   - submittedAt, reviewedAt, reviewedBy

4. visadocuments
   - _id, userId, stage, fileName, filePath
   - status, uploadedAt
   - reviewedBy, reviewedAt, feedback
```

---

## 📡 API Endpoints Summary

### Authentication APIs

```
POST   /api/auth/register                    # User registration
POST   /api/auth/login                       # User login
POST   /api/auth/refresh                     # Refresh Token
GET    /api/auth/registration-token/:token   # Validate token
```

### Onboarding APIs

```
GET    /api/onboarding/status                # Get application status
GET    /api/onboarding/my-application        # Get complete application
POST   /api/onboarding/submit                # Submit/update application
```

### HR Management APIs

```
POST   /api/hr/generate-token                # Generate registration token
GET    /api/hr/applications                  # Get application list
GET    /api/hr/applications/:id              # Get application details
PATCH  /api/hr/applications/:id              # Review application
```

### Profile Management APIs

```
GET    /api/profile/:userId                  # Get personal info
PATCH  /api/profile/:userId/:section         # Update a section
GET    /api/profile/:userId/documents        # Get document list
GET    /api/profile/documents/:id/download   # Download file
```

### Visa Management APIs

```
GET    /api/visa/my-status                   # Get visa status
POST   /api/visa/upload                      # Upload visa file
GET    /api/visa/documents/:stage            # Get stage files

GET    /api/hr/visa/in-progress              # HR: View in-progress visas
PATCH  /api/hr/visa/review/:id               # HR: Review visa file
POST   /api/hr/visa/send-notification/:id    # HR: Send reminder
```

---

## 📈 Current Project Progress

### ✅ Completed

- [x] Database model design
- [x] Authentication middleware
- [x] Registration token system
- [x] OnboardingApplication Model
- [x] Onboarding Controllers & Routes
- [x] File upload middleware (Multer)
- [x] Onboarding Frontend Form

### 🚧 In Progress

- [ ] Frontend API service integration
- [ ] Form data pre-fill
- [ ] HR review page

### 📋 To-Do

- [ ] Profile Management APIs
- [ ] Visa Management System (4 stages)
- [ ] HR Dashboard
- [ ] Email notification functionality
- [ ] File preview/download functionality
- [ ] Unit testing
- [ ] Deployment configuration

---

## 🔐 Security Considerations

### JWT Token Management

```javascript
// Access Token: 15 minutes validity (short-term)
// Refresh Token: 7 days validity (long-term)

// Auto-refresh mechanism:
// When API returns 401, axios interceptor automatically:
// 1. Use refreshToken to get new accessToken
// 2. Update localStorage
// 3. Resend original request
// 4. If refresh fails, redirect to login page
```

### Password Security

```javascript
// Using bcrypt encryption
// Salt rounds: 10
// Storage format: $2b$10$hash...
```

### File Upload Security

- File type validation (whitelist)
- File size limit (5MB)
- Filename sanitization (prevent path traversal)
- Storage path isolation

### API Permission Control

```javascript
// Middleware chain:
router.get('/endpoint',
  verifyToken,      // Verify JWT
  checkRole('HR'),  // Verify role
  controller        // Business logic
);
```

---

## 📞 Contact Information

**Project Team**: Group E  
**Developers**:
- XI JIA - Authentication, Onboarding, HR Management
- ZHENJIA LI - Profile Management, Visa Management

**Last Updated**: 2026-02-03

---

**End of Document** 🎉
