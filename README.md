## Task List:

### **Xi Jia: Authentication & Onboarding Pipeline Focus: Complete user lifecycle from registration → onboarding → approval

- Employee Side: ✅ Registration Page (token validation, form) ✅ Login Page (JWT authentication, session management) ✅ Onboarding Application Page (complex form with conditional logic, file uploads, status handling)

- HR Side: ✅ Login Page (shared with employees) ✅ Hiring Management Page: Token generation & email sending Registration history tracking Onboarding application review (Pending/Rejected/Approved tabs) Application approval/rejection with feedback ✅ Employee Profiles Page (summary view, search, detailed profile view)

- Backend: Auth APIs (register, login, token refresh) Onboarding APIs (submit, update, get status) HR hiring APIs (generate token, send email, review applications) Employee profile APIs (list, search, get details)

### **Zhenjia Li: Personal Information & Visa Document Management Focus: Employee data management + visa workflow automation

- Employee Side: ✅ Personal Information Page (multi-section editing with save/cancel logic) Name section Address section Contact Info section Employment section Emergency contacts section Documents section (list, preview, download) ✅ Visa Status Management Page: 4-stage OPT workflow (Receipt → EAD → I-983 → I-20) Conditional rendering based on approval status Document upload for each stage Display HR feedback

- HR Side: ✅ Visa Status Management Page: "In Progress" view (list employees with incomplete workflows) Display next steps for each employee Document preview & approval/rejection Send reminder emails "All" view (search & filter all visa employees) Download approved documents

- Backend: Personal info APIs (get, update by section) Visa document APIs (upload, get status, list by stage) HR visa management APIs (list employees, approve/reject documents, send notifications) File storage & retrieval (document preview, download)


## 🛠️ Technical Stack 

### **Frontend 
- React + Redux Toolkit
- React Router (for navigation & protected routes)
- Form library: React Hook Form or Formik
- UI library: MUI, Ant Design, or React Bootstrap
- File upload: react-dropzone or native input
- PDF preview: react-pdf or iframe

### **Backend 
- Node.js + Express
- MongoDB + Mongoose
- Authentication: JWT (jsonwebtoken)
- Password hashing: bcryptjs
- Email: nodemailer
- File upload: multer
- Validation: express-validator or Joi