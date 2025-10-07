# Fitness Track Platform - Backend API

A comprehensive backend API for a fitness tracking platform built with Node.js, Express.js, and MongoDB, featuring role-based authentication and user management.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-based Access Control** - User and Admin roles with different permissions
- 🔒 **Password Security** - Bcrypt hashing with salt rounds
- ✅ **Input Validation** - Comprehensive request validation using express-validator
- 🛡️ **Security Middleware** - Helmet, CORS, and rate limiting
- 📊 **User Management** - Complete CRUD operations for user management
- 🏥 **Health Monitoring** - API health check endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing
- **Express-validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## Project Structure

```
fitness-track-platform/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── userController.js    # User management logic
├── middleware/
│   ├── auth.js             # JWT authentication & authorization
│   ├── validation.js       # Input validation
│   └── errorHandler.js     # Global error handling
├── models/
│   └── User.js             # User schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User management routes
│   └── index.js            # Route aggregator
├── server.js               # Main server file
├── package.json            # Dependencies
└── README.md               # Documentation
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with the following variables find at .env.example 

3. **Start the server:**
   ```bash
   # Development mode
   npm run dev   
   ```

### Protected Routes
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **User**: Can access their own profile and fitness data
- **Admin**: Can manage all users and access admin features

## Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Helmet middleware for security headers

## Error Handling

The API includes comprehensive error handling with:
- Validation errors
- Authentication errors
- Authorization errors
- Database errors
- Server errors

All errors return a consistent JSON format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // for validation errors
}
```

## Development

- **Environment**: Set `NODE_ENV=development` for detailed error messages
- **Logging**: Request logging with timestamps
- **Reload**: Use `npm run dev` for development with nodemon

## Production Considerations

1. **Environment Variables**: Use strong, unique JWT secrets
2. **Database**: Use MongoDB Atlas or a production MongoDB instance
3. **CORS**: Configure appropriate CORS origins
4. **Rate Limiting**: Adjust rate limits based on your needs
5. **Monitoring**: Implement proper logging and monitoring
6. **Security**: Regular security updates and audits

## Weekly Summary Emails (Node Backend)

The backend can send weekly summary emails using Nodemailer and a cron schedule.

Environment variables (single `.env` file):

```
ENABLE_WEEKLY_SUMMARY=true
WEEKLY_SUMMARY_CRON=0 9 * * 1
CRON_TZ=UTC
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=Fitness Track <no-reply@example.com>
```

Notes:
- `WEEKLY_SUMMARY_CRON` defaults to `0 9 * * 1` (Mondays at 09:00) if not set.
- `CRON_TZ` defaults to `UTC`.
- Emails are sent to all active users (`isActive: true`).

Manual run (one-off) within the app context for testing:

```js
const { weeklyScheduler } = require('./node-backend/cron/weeklySummary');
await weeklyScheduler();
```