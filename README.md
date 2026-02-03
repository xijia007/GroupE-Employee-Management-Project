## Task List:

### \*\*Xi Jia: Authentication & Onboarding Pipeline Focus: Complete user lifecycle from registration → onboarding → approval

- Employee Side: ✅ Registration Page (token validation, form) ✅ Login Page (JWT authentication, session management) ✅ Onboarding Application Page (complex form with conditional logic, file uploads, status handling)

- HR Side: ✅ Login Page (shared with employees) ✅ Hiring Management Page: Token generation & email sending Registration history tracking Onboarding application review (Pending/Rejected/Approved tabs) Application approval/rejection with feedback ✅ Employee Profiles Page (summary view, search, detailed profile view)

- Backend: Auth APIs (register, login, token refresh) Onboarding APIs (submit, update, get status) HR hiring APIs (generate token, send email, review applications) Employee profile APIs (list, search, get details)

### \*\*Zhenjia Li: Personal Information & Visa Document Management Focus: Employee data management + visa workflow automation

- Employee Side: ✅ Personal Information Page (multi-section editing with save/cancel logic) Name section Address section Contact Info section Employment section Emergency contacts section Documents section (list, preview, download) ✅ Visa Status Management Page: 4-stage OPT workflow (Receipt → EAD → I-983 → I-20) Conditional rendering based on approval status Document upload for each stage Display HR feedback

- HR Side: ✅ Visa Status Management Page: "In Progress" view (list employees with incomplete workflows) Display next steps for each employee Document preview & approval/rejection Send reminder emails "All" view (search & filter all visa employees) Download approved documents

- Backend: Personal info APIs (get, update by section) Visa document APIs (upload, get status, list by stage) HR visa management APIs (list employees, approve/reject documents, send notifications) File storage & retrieval (document preview, download)

## Implementation Order 

### XI JIA 

**Phase 1: Foundation / 第一阶段：基础**
1. Complete authentication middleware ✅ (partially done)
2. Auth controllers & routes (login, register)
3. Test authentication flow

**Phase 2: Employee Onboarding / 第二阶段：员工入职**
4. Create OnboardingApplication model
5. Implement onboarding submission API
6. Build onboarding application page (frontend)
7. Test full onboarding flow (Never Submitted → Pending)

**Phase 3: HR Hiring / 第三阶段：HR 招聘**
8. Implement token generation & email API
9. Build hiring management page (token generation)
10. Implement application review APIs
11. Build application review UI (Pending/Approved/Rejected tabs)
12. Test approval/rejection flow

**Phase 4: HR Employee Profiles / 第四阶段：HR 员工档案**
13. Implement employee list & search APIs
14. Build employee profiles page
15. Build employee detail page
16. Test search & profile viewing

### ZHENJIA LI

**Phase 1: Personal Information / 第一阶段：个人信息**
1. Design reusable EditableSection component
2. Implement profile APIs (get, update by section)
3. Build personal information page with all sections
4. Implement document list, preview, download
5. Test edit/save/cancel flow with rollback

**Phase 2: Employee Visa Management / 第二阶段：员工签证管理**
6. Create VisaDocument model
7. Implement visa document upload & status APIs
8. Create VisaStage component
9. Build visa status management page (4 stages)
10. Test sequential upload workflow (Receipt → EAD → I-983 → I-20)

**Phase 3: HR Visa Management / 第三阶段：HR 签证管理**
11. Implement in-progress list API (calculate next steps)
12. Implement document approval/rejection APIs
13. Build "In Progress" view with preview modal
14. Implement reminder email functionality
15. Build "All" view with search & document download
16. Test full approval workflow from HR perspective


## 🛠️ Technical Stack

### \*\*Frontend

- React + Redux Toolkit
- React Router (for navigation & protected routes)
- Form library: React Hook Form or Formik
- UI library: MUI, Ant Design, or React Bootstrap
- File upload: react-dropzone or native input
- PDF preview: react-pdf or iframe

### \*\*Backend

- Node.js + Express
- MongoDB + Mongoose
- Authentication: JWT (jsonwebtoken)
- Password hashing: bcryptjs
- Email: nodemailer
- File upload: multer
- Validation: express-validator or Joi
