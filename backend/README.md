# Backend 运行步骤

## 1. 安装依赖

```bash
cd backend
npm install
```

## 2. 配置环境变量

在 `backend` 目录下创建 `.env` 文件，包含以下内容：

```env
# MongoDB 连接
MONGODB_URI=mongodb://localhost:27017/employee_management

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# Port
PORT=3001

# Node Environment
NODE_ENV=development
```

## 3. 启动 MongoDB

确保 MongoDB 正在运行：

```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

## 4. 启动后端服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## 5. 测试 API

服务器启动后，访问：

- 基础测试: http://localhost:3001/
- Auth API: http://localhost:3001/api/auth
- User Profile API: http://localhost:3001/api/user/profile

## API 路由说明

### Auth Routes (`/api/auth`)

- `GET /api/auth/registration-token/:token` - 验证注册令牌
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新访问令牌

### User Profile Routes (`/api/user`)

- `GET /api/user/profile` - 获取用户资料（需要认证）
- `PUT /api/user/profile` - 更新用户资料（需要 Employee 角色）

## 注意事项

- 确保 MongoDB 正在运行
- 检查 .env 文件配置正确
- Profile 相关的 API 需要 JWT token 认证
