# Authentication System Backend

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL database

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/9keystrokes/Authentication-System---Backend-Assignment---InterviewCall-Kolkata
cd auth-system-backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` environment file

Edit the `.env` file with your database credentials.

4. Setup MySQL database
- Create a database named `auth_system`
- The application will automatically create the required tables

5. Build and run the application
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## Tech Stack Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework  
- **TypeScript** - Type-safe JavaScript
- **MySQL** - Database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Zod** - Input validation

## Sample .env Configuration

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auth_system
DB_USER=your_database_user
DB_PASS=your_database_password

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=60d
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_REFRESH_EXPIRES_IN=60d

# Server Configuration
NODE_ENV=development
PORT=3000
```

## API Testing Commands (Linux)

### Health Check
```bash
curl -X GET http://localhost:3000/health
```

### User Registration
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "role": "user"
  }'
```

### User Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Get User Profile (Protected Route)
```bash
# Replace YOUR_JWT_TOKEN with the token received from login
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User Profile
```bash
curl -X PUT http://localhost:3000/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }'
```

### Change Password
```bash
curl -X PUT http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "Password123!",
    "newPassword": "NewPassword456!"
  }'
```

### Password Reset Request
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### Password Reset (with token)
```bash
# Replace RESET_TOKEN with the token received via email/console
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN",
    "password": "ResetPassword789!"
  }'
```

### Refresh Token
```bash
# Replace YOUR_REFRESH_TOKEN with the refresh token received from login
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Admin Routes (Role-based Access)

#### Get All Users (Admin Only)
```bash
# Replace ADMIN_JWT_TOKEN with admin user's token
curl -X GET http://localhost:3000/auth/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Update User Role (Admin Only)
```bash
curl -X PUT http://localhost:3000/auth/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "role": "admin"
  }'
```

#### Delete User (Admin Only)
```bash
curl -X DELETE http://localhost:3000/auth/users/USER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Testing Sequence Example

1. **Register a user:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "Password123!"}'
```

2. **Login and save token:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Password123!"}' \
  | jq -r '.data.token')
```

3. **Use token for protected routes:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Response Examples

**Successful Login Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```
