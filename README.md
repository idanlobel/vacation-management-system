# 🏖️ Vacation Management System

A full-stack web application for managing employee vacation requests with separate interfaces for employees, managers, and administrators.

## 📋 Table of Contents

- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [Technical Choices](#-technical-choices)
- [Features](#-features)
- [Known Limitations](#-known-limitations)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/vacation-management-system.git
cd vacation-management-system
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup database (creates SQLite file and tables)
npx knex migrate:latest

# Add sample data
npx knex seed:run

# Start the backend server
npm run dev
```

The backend will start on **http://localhost:3000**

### Step 3: Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:5173**

### Step 4: Access the Application

Open your browser and go to **http://localhost:5173**

## 🎮 Usage

### Demo Accounts

The system comes with pre-loaded demo accounts:

| Role | Name | Email |
|------|------|-------|
| Employee | John Doe | john.doe@company.com |
| Employee | Jane Smith | jane.smith@company.com |
| Employee | Bob Brown | bob.brown@company.com |
| Manager | Mike Johnson | mike.johnson@company.com |
| Manager | Sarah Wilson | sarah.wilson@company.com |

### How to Use

1. **Employee Portal** (`/requester`)
   - Select your employee profile
   - Submit vacation requests with dates and reasons
   - View your request history and status

2. **Manager Portal** (`/validator`)
   - Select your manager profile
   - Review all pending vacation requests
   - Approve or reject requests with comments

3. **User Management** (`/users`)
   - Add new employees and managers
   - Edit existing user information
   - Delete users (with confirmation)

## 🛠️ Technical Choices

### Frontend: Vue.js 3

**Why Vue.js?**
- **Simplicity**: Easy to learn and implement
- **Composition API**: Modern, reactive programming model
- **Single File Components**: Clean code organization
- **Vue Router**: Built-in routing solution
- **Lightweight**: Small bundle size

### Backend: Node.js + Express

**Why Node.js/Express?**
- **JavaScript Everywhere**: Same language for frontend and backend
- **Fast Development**: Rapid prototyping and development
- **Express.js**: Minimal, flexible web framework
- **Large Ecosystem**: Extensive npm package library
- **JSON Native**: Perfect for REST APIs

### Database: SQLite

**Why SQLite?**
- **Zero Configuration**: No database server setup required
- **File-Based**: Easy to backup and share
- **Perfect for Prototyping**: Quick to get started
- **Cross-Platform**: Works everywhere


### ORM: Knex.js

**Why Knex.js?**
- **Query Builder**: SQL-like syntax
- **Database Agnostic**: Easy to switch between databases
- **Migrations**: Version control for database schema
- **Seeds**: Consistent test data setup

### Validation: Express-Validator

**Why Express-Validator?**
- **Comprehensive**: Covers all validation needs
- **Chain-able**: Clean, readable validation rules
- **Sanitization**: Built-in data cleaning
- **Error Handling**: Structured error responses

## ✨ Features

### Employee Features
- ✅ Submit vacation requests with date validation
- ✅ View personal request history
- ✅ Track request status (Pending/Approved/Rejected)
- ✅ Delete pending requests
- ✅ Responsive mobile design

### Manager Features
- ✅ Dashboard with request statistics
- ✅ View all employee requests
- ✅ Filter requests by status
- ✅ Approve/reject with comments
- ✅ Bulk management capabilities

### Administrator Features
- ✅ Add new employees and managers
- ✅ Edit existing user information
- ✅ Delete users with confirmation
- ✅ View user statistics
- ✅ Role-based access management

### Technical Features
- ✅ RESTful API design
- ✅ Input validation and sanitization
- ✅ Error handling and user feedback
- ✅ Database migrations and seeding
- ✅ Cross-Origin Resource Sharing (CORS)
- ✅ Security headers (Helmet.js)

## ⚠️ Known Limitations

### Authentication & Security
- **No Authentication**: Users are selected from a dropdown (demo purpose)
- **No Password Protection**: Suitable for internal networks only
- **No Session Management**: Each page visit is independent
- **No Role-Based Permissions**: Frontend-only role separation

### Scalability
- **SQLite Limitations**: Single-user database, not suitable for high concurrency
- **No Caching**: All data fetched from database on each request
- **No Pagination**: All records loaded at once
- **No Real-time Updates**: Manual refresh required

### Business Logic
- **Simple Approval Flow**: Only single-level approval (no complex workflows)
- **No Date Conflicts**: System doesn't check for overlapping requests
- **No Leave Balance**: Doesn't track remaining vacation days
- **No Email Notifications**: No automated notifications for approvals/rejection

## 📁 Project Structure

```
vacation-management-system/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── controllers/        # API route handlers
│   │   │   ├── usersController.js
│   │   │   └── vacationRequestsController.js
│   │   ├── models/            # Database models
│   │   │   ├── User.js
│   │   │   └── VacationRequest.js
│   │   ├── routes/            # API routes
│   │   │   ├── users.js
│   │   │   └── vacationRequests.js
│   │   ├── middleware/        # Express middleware
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── db.js             # Database connection
│   │   └── server.js         # Main server file
│   ├── migrations/           # Database schema
│   ├── seeds/               # Sample data
│   ├── tests/               # Backend tests
│   ├── knexfile.js          # Database configuration
│   └── package.json         # Dependencies and scripts
├── frontend/                # Vue.js application
│   ├── src/
│   │   ├── components/      # Reusable Vue components
│   │   │   ├── Alert.vue
│   │   │   ├── UserSelector.vue
│   │   │   ├── VacationRequestForm.vue
│   │   │   ├── VacationRequestsList.vue
│   │   │   ├── UserForm.vue
│   │   │   ├── UsersList.vue
│   │   │   └── EditUserModal.vue
│   │   ├── views/           # Page components
│   │   │   ├── Home.vue
│   │   │   ├── RequesterDashboard.vue
│   │   │   ├── ValidatorDashboard.vue
│   │   │   └── UserManagement.vue
│   │   ├── router/          # Vue Router config
│   │   │   └── index.js
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── utils/           # Helper functions
│   │   │   └── helpers.js
│   │   ├── App.vue          # Main app component
│   │   ├── main.js          # App entry point
│   │   └── style.css        # Global styles
│   ├── public/              # Static assets
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Dependencies and scripts
├── README.md                # This file
└── .gitignore              # Git ignore rules
```

## 🔌 API Endpoints

### Users API
```http
GET    /api/users              # Get all users
POST   /api/users              # Create new user
GET    /api/users/:id          # Get user by ID
PUT    /api/users/:id          # Update user
DELETE /api/users/:id          # Delete user
```

### Vacation Requests API
```http
GET    /api/vacation-requests              # Get all requests
POST   /api/vacation-requests              # Create request
GET    /api/vacation-requests/user/:id     # Get user's requests
PUT    /api/vacation-requests/:id/approve  # Approve request
PUT    /api/vacation-requests/:id/reject   # Reject request
DELETE /api/vacation-requests/:id          # Delete request
```

### Health Check
```http
GET    /health                 # Server health status
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Production Deployment

### Environment Variables

Create `.env` files:

**Backend (.env):**
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_NAME=vacation_management
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-api-domain.com/api
```

### Build for Production

```bash
# Frontend build
cd frontend
npm run build

# Backend (use process manager like PM2)
npm install -g pm2
pm2 start backend/src/server.js --name vacation-api
```

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

---

⭐ **Star this repository if it helped you!**
