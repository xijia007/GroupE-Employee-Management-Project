# 📋 Employee Management System - 完整系统流程文档

> **文档版本**: v1.0  
> **最后更新**: 2026-02-03  
> **项目**: Employee Management System  
> **团队**: Group E - Phase 2

---

## 📑 目录

- [系统架构概述](#系统架构概述)
- [Phase 1: 用户注册与认证流程](#phase-1-用户注册与认证流程)
- [Phase 2: 员工入职申请流程](#phase-2-员工入职申请流程)
- [Phase 3: HR 审核流程](#phase-3-hr-审核流程)
- [Phase 4: 个人信息管理流程](#phase-4-个人信息管理流程)
- [Phase 5: 签证状态管理流程](#phase-5-签证状态管理流程)
- [完整数据流架构](#完整数据流架构)
- [技术栈总览](#技术栈总览)
- [API 端点总结](#API-端点总结)

---

## 🏗️ 系统架构概述

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMPLOYEE MANAGEMENT SYSTEM                    │
│                                                                  │
│  ┌─────────────┐        ┌──────────┐        ┌──────────────┐   │
│  │  HR 管理端  │  ←→    │  Backend │   ←→   │   员工端     │   │
│  │             │        │  Server  │        │              │   │
│  │ • 生成令牌  │        │  Express │        │ • 注册账号   │   │
│  │ • 审核申请  │        │  MongoDB │        │ • 提交申请   │   │
│  │ • 管理签证  │        │  JWT     │        │ • 管理信息   │   │
│  └─────────────┘        └──────────┘        └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 核心功能模块

| 模块 | 功能 | 用户角色 |
|------|------|----------|
| **Authentication** | 注册、登录、Token 管理 | All |
| **Onboarding** | 员工入职申请提交与审核 | Employee + HR |
| **Profile Management** | 个人信息编辑与管理 | Employee |
| **Visa Management** | 签证文件上传与审核（4阶段） | Employee + HR |
| **HR Dashboard** | 员工管理、申请审核、签证跟踪 | HR Only |

---

## 🎯 Phase 1: 用户注册与认证流程

### 流程概述

HR 生成注册令牌 → 发送邮件 → 员工注册 → 员工登录

### 详细流程图

```
HR Side (招聘方)                    Backend                    Employee Side (员工)
────────────────                    ───────                    ─────────────────

1. HR 登录系统
   ↓
2. 生成注册令牌
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
3. 发送邮件
   📧 Email Service
   Subject: "Welcome to Company"
   Link: http://localhost:5173/register?token=abc123
                                                           ↓
                                                    4. 员工收到邮件
                                                       点击注册链接
                                                           ↓
                                                    5. 前端验证令牌
                                                       GET /api/auth/registration-token/abc123
                                                       ← { email: "john@...", name: "John Doe" }
                                                           ↓
                                                    6. 填写注册表单
                                                       ┌─────────────────┐
                                                       │ Email: (预填充)  │
                                                       │ Name: (预填充)   │
                                                       │ Username: ___    │
                                                       │ Password: ___    │
                                                       └─────────────────┘
                                                           ↓
                                                    7. 提交注册
                                                       POST /api/auth/register
                                                       {
                                                         token: "abc123",
                                                         username: "johndoe",
                                                         password: "SecurePass123"
                                                       }
   ┌──────────────────────────┐ ← ──────────────── ↓
   │ Database Updates:        │                    Backend 处理:
   │                          │                    - 验证令牌
   │ User (新建)              │                    - 密码加密
   │ ┌─────────────────────┐ │                    - 创建用户
   │ │ username: "johndoe" │ │                    - 标记令牌为 "Submitted"
   │ │ password: (hashed)  │ │
   │ │ role: "Employee"    │ │
   │ │ onboardingStatus:   │ │
   │ │   "Never Submitted" │ │
   │ └─────────────────────┘ │
   │                          │
   │ RegistrationToken (更新) │
   │ ┌─────────────────────┐ │
   │ │ status: "Submitted" │ │
   │ └─────────────────────┘ │
   └──────────────────────────┘
                                                           ↓
                                                    8. 注册成功
                                                       自动跳转到登录页
                                                           ↓
                                                    9. 用户登录
                                                       POST /api/auth/login
                                                       {
                                                         username: "johndoe",
                                                         password: "SecurePass123"
                                                       }
                                                           ↓
                                                    10. 获取 JWT Token
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
                                                    11. 保存到 localStorage
                                                        - accessToken
                                                        - refreshToken
                                                        - user
                                                           ↓
                                                    12. 跳转到 Dashboard
```

### 关键 API 端点

| 方法 | 端点 | 描述 | 权限 |
|------|------|------|------|
| POST | `/api/hr/generate-token` | 生成注册令牌 | HR Only |
| GET | `/api/auth/registration-token/:token` | 验证令牌有效性 | Public |
| POST | `/api/auth/register` | 用户注册 | Public |
| POST | `/api/auth/login` | 用户登录 | Public |
| POST | `/api/auth/refresh` | 刷新 Access Token | Authenticated |

### 数据库变化

**RegistrationToken Collection:**
- `status`: `"Sent"` → `"Submitted"`

**User Collection (新建):**
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

## 🎯 Phase 2: 员工入职申请流程

### 流程概述

员工登录 → 查看状态 → 填写表单 → 上传文件 → 提交申请 → 状态变为 Pending

### 详细流程图

```
Employee Side (员工)                Backend                    Database
────────────────                    ───────                    ────────

1. 员工登录后看到
   onboardingStatus: "Never Submitted"
   ↓
2. 点击 "Complete Onboarding"
   进入 /onboarding 页面
   ↓
3. 页面加载，检查状态
   GET /api/onboarding/status
   ↓                                  Authorization: Bearer <token>
                                      ↓
                                   验证 JWT
                                   提取 userId
                                      ↓
                                   查询数据库
                                   OnboardingApplication.findOne({ userId })
                                      ↓                           ↓
                                   未找到记录              找到记录
                                      ↓                           ↓
   ← 200 OK                        { status:             { status: "Pending",
   { status: "Never Submitted" }     "Never Submitted" }   feedback: "..." }
   ↓
4. 显示空表单
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
5. 员工填写表单并上传文件
   ↓
6. 点击 "Submit"
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
                                   验证 JWT
                                   提取 userId
                                      ↓
                                   Multer 处理文件上传
                                      ↓
                                   保存文件到 /uploads/documents/
                                   生成文件路径: "userId_timestamp_filename.pdf"
                                      ↓
                                   查询现有申请
                                   OnboardingApplication.findOne({ userId })
                                      ↓                           ↓
                                   未找到                      找到记录
                                   创建新申请                  更新现有申请
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
                                   更新 User 表
                                   User.findByIdAndUpdate(userId, {
                                     onboardingStatus: 'Pending'
                                   })
                                      ↓
   ← 200 OK                        返回成功响应
   {
     message: "Application submitted successfully",
     application: { ... }
   }
   ↓
7. 显示成功消息
   ✅ "Application submitted successfully!"
   ↓
8. 状态更新为 "Pending"
   Alert: "Application Status: Pending"
   ↓
9. 表单变为只读模式
   (等待 HR 审核)
```

### 关键 API 端点

| 方法 | 端点 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/onboarding/status` | 获取申请状态 | Employee |
| GET | `/api/onboarding/my-application` | 获取完整申请数据 | Employee |
| POST | `/api/onboarding/submit` | 提交/更新申请 | Employee |

### 文件上传处理

**Multer 配置:**
- 存储路径: `/uploads/documents/`
- 文件命名: `{userId}_{timestamp}_{originalname}`
- 文件限制: 5MB
- 允许类型: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.doc`, `.docx`

**上传字段:**
```javascript
{
  name: 'driverLicense', maxCount: 1,
  name: 'workAuthorization', maxCount: 1,
  name: 'other', maxCount: 1
}
```

### 数据库变化

**OnboardingApplication Collection (新建):**
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

**User Collection 更新:**
```json
{
  "onboardingStatus": "Never Submitted" → "Pending"
}
```

---

## 🎯 Phase 3: HR 审核流程

### 流程概述

HR 查看申请列表 → 查看详情 → 审核文件 → 批准/拒绝 → 发送通知

### 详细流程图

```
HR Side (HR)                       Backend                    Employee Side
────────────                       ───────                    ─────────────

1. HR 登录系统
   (role: "HR")
   ↓
2. 进入 "Hiring Management" 页面
   GET /api/hr/applications?status=Pending
   ↓
   Backend 返回待审核列表
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
3. HR 查看申请列表
   ┌────────────────────────────────────────┐
   │ Pending Applications                    │
   ├────────────────────────────────────────┤
   │ Name         Email         Submitted    │
   │ John Doe     john@...     2024-01-15   │ [View]
   │ Jane Smith   jane@...     2024-01-16   │ [View]
   └────────────────────────────────────────┘
   ↓
4. 点击 [View] 查看详情
   GET /api/hr/applications/:id
   ↓
   Backend 返回完整申请
   ← {
       firstName: "John",
       lastName: "Doe",
       email: "john@example.com",
       ssn: "XXX-XX-XXXX",  // 部分隐藏
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
5. HR 审核申请细节
   - 查看个人信息
   - 下载查看文件
     GET /uploads/documents/xxx.pdf
   - 验证信息正确性
   ↓
6. HR 做出决定
   ┌────────┬────────┐
   │ Approve│ Reject │
   └────────┴────────┘
   ↓                    ↓
   批准                拒绝
   ↓                    ↓
   PATCH /api/hr/applications/:id
   {                    {
     status: "Approved",  status: "Rejected",
     feedback: "Welcome!" feedback: "Please resubmit SSN"
   }                    }
   ↓                    ↓
   Backend 处理:        Backend 处理:
   - 更新 OnboardingApplication
   - application.status = "Approved"
   - application.feedback = "Welcome!"
   - application.reviewedAt = new Date()
   - application.reviewedBy = hrUserId
   ↓                    ↓
   - 更新 User 表
   - user.onboardingStatus = "Approved"
   ↓                    ↓
   - 发送通知邮件     - 发送通知邮件
   📧 "Congratulations!" 📧 "Please review feedback"
   ↓                    ↓
   返回成功            返回成功
                                                    ↓
                                                员工收到邮件通知
                                                    ↓
                                                登录系统查看状态
                                                GET /api/onboarding/status
                                                    ↓
                                                { 
                                                  status: "Approved",
                                                  feedback: "Welcome!",
                                                  reviewedAt: "2024-01-16"
                                                }
                                                    ↓
                                                显示批准状态
                                                ✅ Alert: "Application Approved"
```

### 关键 API 端点

| 方法 | 端点 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/hr/applications` | 获取申请列表（支持过滤） | HR Only |
| GET | `/api/hr/applications/:id` | 获取申请详情 | HR Only |
| PATCH | `/api/hr/applications/:id` | 更新申请状态（批准/拒绝） | HR Only |
| GET | `/uploads/documents/:filename` | 下载文件 | Authenticated |

### 数据库变化

**OnboardingApplication 更新:**
```json
{
  "status": "Pending" → "Approved" / "Rejected",
  "feedback": "Welcome to the team!",
  "reviewedAt": "2024-01-16T14:30:00Z",
  "reviewedBy": "hr_user_id_456"
}
```

**User 更新:**
```json
{
  "onboardingStatus": "Pending" → "Approved" / "Rejected"
}
```

---

## 🎯 Phase 4: 个人信息管理流程

### 流程概述

员工查看个人信息 → 编辑某个部分 → 保存更改 → 查看更新

### 详细流程图

```
Employee (已批准员工)              Backend                    Database
────────────────────              ───────                    ────────

1. 员工登录
   onboardingStatus: "Approved"
   ↓
2. 进入 "Personal Information" 页面
   GET /api/profile/:userId
   ↓
   Backend 返回个人信息
   ← {
       personalInfo: { firstName, lastName, ... },
       address: { ... },
       contactInfo: { ... },
       employment: { ... },
       emergencyContacts: [ ... ],
       documents: [ ... ]
     }
   ↓
3. 查看个人信息
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
4. 点击 [Edit] 编辑某个部分
   (例如：Address Section)
   ↓
   Section 变为编辑模式
   ┌──────────────────────────────────┐
   │ Address Section    [Save][Cancel] │
   │ Building: [123        ]            │
   │ Street:   [Main St    ]            │
   │ City:     [New York   ]            │
   │ State:    [NY         ]            │
   │ Zip:      [10001      ]            │
   └──────────────────────────────────┘
   ↓
5. 修改信息后点击 [Save]
   PATCH /api/profile/:userId/address
   {
     building: "456",
     street: "Oak Ave",
     city: "Boston",
     state: "MA",
     zip: "02101"
   }
   ↓
   Backend 更新数据
   OnboardingApplication.findOneAndUpdate(
     { userId },
     { $set: { "currentAddress": newAddress } }
   )
   ↓
   ← 200 OK
   { message: "Address updated successfully" }
   ↓
6. Section 恢复查看模式
   显示更新后的地址
```

### 可编辑的部分（Sections）

| Section | 字段 | API 端点 |
|---------|------|----------|
| **Personal Info** | firstName, lastName, preferredName, DOB | `PATCH /api/profile/:userId/personal` |
| **Address** | building, street, city, state, zip | `PATCH /api/profile/:userId/address` |
| **Contact** | cellPhone, workPhone, email | `PATCH /api/profile/:userId/contact` |
| **Emergency Contact** | emergencyContacts array | `PATCH /api/profile/:userId/emergency` |

### 关键 API 端点

| 方法 | 端点 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/profile/:userId` | 获取完整个人信息 | Employee (Own) |
| PATCH | `/api/profile/:userId/:section` | 更新某个部分 | Employee (Own) |
| GET | `/api/profile/:userId/documents` | 获取文档列表 | Employee (Own) |
| GET | `/api/profile/documents/:fileId/download` | 下载文件 | Employee (Own) |

---

## 🎯 Phase 5: 签证状态管理流程

### 流程概述

员工查看签证阶段 → 上传文件 → HR 审核 → 解锁下一阶段 → 循环直到完成

### 签证管理 4 个阶段

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

### 详细流程图

```
Employee (F1 签证员工)             Backend                    HR Side
───────────────────              ───────                    ────────

1. 员工进入 "Visa Status" 页面
   GET /api/visa/my-status
   ↓
   Backend 返回签证流程状态
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
2. 查看 4 个阶段
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
3. OPT Receipt 已批准
   可以上传 OPT EAD
   ↓
4. 上传 OPT EAD 文件
   POST /api/visa/upload
   {
     stage: "OPT_EAD",
     file: <File>
   }
   ↓
   Backend 处理上传
   - 保存文件
   - 创建 VisaDocument 记录
   - 发送通知给 HR
   ↓
   ← 200 OK
   { message: "Document uploaded, waiting for review" }
                                                         ↓
                                                    HR 收到通知
                                                    查看待审核文件
                                                         ↓
                                                    HR 审核 OPT EAD
                                                    PATCH /api/visa/review/:id
                                                    { status: "Approved" }
                                                         ↓
                                                    系统自动解锁下一阶段
   ← Notification                                  (I-983)
   📧 "Your OPT EAD has been approved"
   ↓
5. 员工收到通知
   刷新页面
   ↓
6. I-983 阶段解锁
   可以继续上传
   (循环流程直到 4 个阶段全部完成)
```

### 签证阶段状态

| 状态 | 说明 | 员工操作 | HR 操作 |
|------|------|----------|---------|
| **Not Started** | 未开始（锁定） | 无法上传 | 无 |
| **Pending** | 已上传，等待 HR 审核 | 可查看 | 可审核 |
| **Approved** | HR 已批准 | 只读 | 只读 |
| **Rejected** | HR 拒绝，需重新上传 | 可重新上传 | 可再次审核 |

### 关键 API 端点

| 方法 | 端点 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/visa/my-status` | 获取签证状态（4阶段） | Employee |
| POST | `/api/visa/upload` | 上传签证文件 | Employee |
| GET | `/api/visa/documents/:stage` | 获取某阶段文件 | Employee |
| GET | `/api/hr/visa/in-progress` | 获取所有进行中的签证 | HR Only |
| PATCH | `/api/hr/visa/review/:id` | 审核签证文件 | HR Only |
| POST | `/api/hr/visa/send-notification/:id` | 发送提醒邮件 | HR Only |

### 数据库变化

**VisaDocument Collection (新建):**
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

## 📊 完整数据流架构

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

### 请求/响应流程示例

**示例：提交入职申请**

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
   - verifyToken: 验证 JWT, 提取 userId
   - uploadMultiple: Multer 处理文件上传
   - submitApplication: 业务逻辑
   ↓
3. Backend (Controller)
   ↓
   submitApplication(req, res)
   ↓
   - 解析 req.body 和 req.files
   - 验证数据
   - 保存文件路径
   ↓
4. Database (MongoDB)
   ↓
   OnboardingApplication.create({ ... })
   User.findByIdAndUpdate({ ... })
   ↓
   返回保存的文档
   ↓
5. Response 返回
   ↓
   res.status(200).json({ message: "Success", application })
   ↓
6. Frontend 接收
   ↓
   .then(data => { message.success(...) })
   ↓
   更新 UI 状态
```

---

## 🛠️ 技术栈总览

### Frontend 技术栈

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

### Backend 技术栈

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

### 数据库 Schema

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

## 📡 API 端点总结

### Authentication APIs

```
POST   /api/auth/register                    # 用户注册
POST   /api/auth/login                       # 用户登录
POST   /api/auth/refresh                     # 刷新 Token
GET    /api/auth/registration-token/:token   # 验证令牌
```

### Onboarding APIs

```
GET    /api/onboarding/status                # 获取申请状态
GET    /api/onboarding/my-application        # 获取完整申请
POST   /api/onboarding/submit                # 提交/更新申请
```

### HR Management APIs

```
POST   /api/hr/generate-token                # 生成注册令牌
GET    /api/hr/applications                  # 获取申请列表
GET    /api/hr/applications/:id              # 获取申请详情
PATCH  /api/hr/applications/:id              # 审核申请
```

### Profile Management APIs

```
GET    /api/profile/:userId                  # 获取个人信息
PATCH  /api/profile/:userId/:section         # 更新某个部分
GET    /api/profile/:userId/documents        # 获取文档列表
GET    /api/profile/documents/:id/download   # 下载文件
```

### Visa Management APIs

```
GET    /api/visa/my-status                   # 获取签证状态
POST   /api/visa/upload                      # 上传签证文件
GET    /api/visa/documents/:stage            # 获取某阶段文件

GET    /api/hr/visa/in-progress              # HR: 查看进行中的签证
PATCH  /api/hr/visa/review/:id               # HR: 审核签证文件
POST   /api/hr/visa/send-notification/:id    # HR: 发送提醒
```

---

## 📈 项目当前进度

### ✅ 已完成

- [x] 数据库模型设计
- [x] Authentication 中间件
- [x] 注册令牌系统
- [x] OnboardingApplication Model
- [x] Onboarding Controllers & Routes
- [x] 文件上传中间件（Multer）
- [x] Onboarding Frontend Form

### 🚧 进行中

- [ ] 前端 API 服务集成
- [ ] 表单数据回显
- [ ] HR 审核页面

### 📋 待完成

- [ ] Profile Management APIs
- [ ] Visa Management System (4 stages)
- [ ] HR Dashboard
- [ ] Email 通知功能
- [ ] 文件预览/下载功能
- [ ] 单元测试
- [ ] 部署配置

---

## 🔐 安全考虑

### JWT Token 管理

```javascript
// Access Token: 15分钟有效期（短期）
// Refresh Token: 7天有效期（长期）

// 自动刷新机制：
// 当 API 返回 401 时，axios interceptor 自动：
// 1. 使用 refreshToken 获取新的 accessToken
// 2. 更新 localStorage
// 3. 重新发送原始请求
// 4. 如果刷新失败，跳转到登录页
```

### 密码安全

```javascript
// 使用 bcrypt 加密
// Salt rounds: 10
// 存储格式: $2b$10$hash...
```

### 文件上传安全

- 文件类型验证（白名单）
- 文件大小限制（5MB）
- 文件名清理（防止路径遍历）
- 存储路径隔离

### API 权限控制

```javascript
// 中间件链：
router.get('/endpoint',
  verifyToken,      // 验证 JWT
  checkRole('HR'),  // 验证角色
  controller        // 业务逻辑
);
```

---

## 📞 联系方式

**项目团队**: Group E  
**开发者**:
- XI JIA - Authentication, Onboarding, HR Management
- ZHENJIA LI - Profile Management, Visa Management

**最后更新**: 2026-02-03

---

**文档结束** 🎉
