# 🚀 AI-Powered Inventory Management System

A full-stack web application for educational institutions to manage inventory, resources, and requests with role-based access control and AI-powered forecasting.

## ✨ Features

### 🔐 Authentication & Authorization

- **Role-based access control**: Admin and Staff roles
- **Department-based filtering**: Users only see their department's data
- **JWT-based authentication**: Secure token-based sessions
- **Password encryption**: Bcrypt hashing for security

### 📦 Inventory Management

- **CRUD operations**: Create, Read, Update, Delete items
- **Department filtering**: Staff can only manage their department's items
- **Stock level tracking**: Monitor current stock vs minimum levels
- **Category organization**: Electronics, Furniture, Books, Sports, etc.
- **Location tracking**: Track where items are stored

### 📋 Request Management

- **Request creation**: Staff can create requests for items
- **Approval workflow**: Admins approve/decline requests
- **Status tracking**: Pending, Approved, Declined, Completed
- **Department isolation**: Staff only see their department's requests

### 🤖 AI Forecasting

- **Usage prediction**: Predict future item usage based on historical data
- **Stock risk assessment**: Identify items at risk of stockout
- **Recommendations**: AI-powered suggestions for inventory management
- **Trend analysis**: Visual charts showing usage patterns

### 📊 Reports & Analytics

- **Monthly usage reports**: Track usage over time
- **Department distribution**: See usage across departments
- **Category analysis**: Understand which categories are most used
- **Request status tracking**: Monitor request approval rates
- **Export functionality**: Download reports as CSV

### 🎨 Modern UI/UX

- **Responsive design**: Works on desktop, tablet, and mobile
- **Real-time updates**: Live data without page refresh
- **Interactive charts**: Chart.js powered visualizations
- **Role-based UI**: Different interfaces for different user types

## 🏗️ Architecture

### Backend (Node.js + Express)

```
server/
├── app.js                 # Main server file
├── config.js             # Configuration settings
├── models/               # MongoDB schemas
│   ├── User.js          # User model with roles
│   ├── Item.js          # Inventory items
│   ├── Request.js       # Request management
│   └── UsageLog.js      # Usage tracking
├── controllers/          # Business logic
│   ├── authController.js # Authentication
│   ├── itemController.js # Inventory management
│   ├── requestController.js # Request handling
│   ├── forecastController.js # AI forecasting
│   └── reportController.js # Analytics
├── middleware/           # Custom middleware
│   └── auth.js          # JWT & role-based auth
├── routes/              # API endpoints
│   ├── auth.js          # Authentication routes
│   ├── items.js         # Inventory routes
│   ├── requests.js      # Request routes
│   ├── forecast.js      # AI forecast routes
│   └── reports.js       # Analytics routes
└── seed.js              # Database seeding
```

### Frontend (Vanilla JavaScript)

```
client/
├── index.html           # Login/Register page
├── dashboard.html       # Main dashboard
├── css/
│   └── styles.css      # Styling
└── js/
    ├── auth.js         # Authentication logic
    ├── dashboard.js    # Main dashboard
    ├── inventory.js    # Inventory management
    ├── requests.js     # Request handling
    ├── forecast.js     # AI forecasting
    └── reports.js      # Analytics
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-powered-inventory
npm install
cd server && npm install
```

### 2. Database Setup

#### Option A: MongoDB Atlas (Recommended)

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `server/config.js` with your MongoDB URI

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Update `server/config.js` to use local MongoDB

### 3. Environment Configuration

Create `server/.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=your-mongodb-connection-string
PORT=5000
```

### 4. Seed Database

```bash
cd server
npm run seed
```

### 5. Start the Application

```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Serve frontend (optional)
cd client
npx http-server -p 8080
```

### 6. Access the Application

- **Main App**: http://localhost:8080/client/index.html
- **Test Page**: http://localhost:8080/test-login.html

## 👥 Demo Accounts

### Admin Account (Full Access)

- **Email**: admin@college.edu
- **Password**: admin123
- **Access**: All departments, all features

### Staff Accounts (Department-Specific)

- **Lab Manager**: lab@college.edu / lab123
- **Library Manager**: library@college.edu / library123
- **Sports Coordinator**: sports@college.edu / sports123
- **Hostel Manager**: hostel@college.edu / hostel123
- **General Manager**: general@college.edu / general123

## 🔐 Role-Based Access Control

### Admin Role

- ✅ View all departments and items
- ✅ Create, update, delete any item
- ✅ Approve/decline all requests
- ✅ Access all reports and analytics
- ✅ User management (future feature)
- ✅ System settings (future feature)

### Staff Role

- ✅ View only their department's items
- ✅ Create and update items in their department
- ✅ Create requests for their department
- ✅ View their own requests
- ✅ Access department-specific reports
- ❌ Cannot delete items
- ❌ Cannot approve/decline requests
- ❌ Cannot access other departments

## 📊 Department Structure

| Department  | Description          | Sample Items                                 |
| ----------- | -------------------- | -------------------------------------------- |
| **Lab**     | Laboratory equipment | Microscopes, Test tubes, Laptops             |
| **Library** | Books and resources  | Textbooks, Reference books, Study tables     |
| **Sports**  | Athletic equipment   | Basketballs, Football gear, Cricket bats     |
| **Hostel**  | Dormitory furniture  | Beds, Wardrobes, Study chairs                |
| **Admin**   | Office supplies      | Office chairs, Printers                      |
| **General** | Common supplies      | Printer paper, Whiteboard markers, First aid |

## 🤖 AI Forecasting Features

### Predictive Analytics

- **Usage Pattern Analysis**: Analyzes historical usage data
- **Stock Risk Assessment**: Identifies items at risk of stockout
- **Demand Forecasting**: Predicts future item requirements
- **Smart Recommendations**: Suggests optimal stock levels

### Risk Levels

- **Critical**: Out of stock (0 items)
- **High**: Below minimum stock level
- **Medium**: Stock below predicted usage
- **Low**: Adequate stock levels

## 📈 Reports & Analytics

### Available Reports

1. **Monthly Usage Trends**: Track usage over time
2. **Department Distribution**: Usage across departments
3. **Category Analysis**: Most used categories
4. **Request Status**: Approval rates and trends
5. **Stock Alerts**: Items needing attention

### Export Features

- CSV export for all reports
- Custom date range reports
- Department-specific exports

## 🛠️ API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Inventory Management

- `GET /api/items` - Get all items (filtered by department)
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item (admin only)

### Request Management

- `GET /api/requests` - Get requests (filtered by department)
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id/approve` - Approve request (admin only)
- `PUT /api/requests/:id/decline` - Decline request (admin only)

### AI Forecasting

- `GET /api/forecast` - Get AI forecast data
- `GET /api/forecast/top-used` - Get top used items
- `GET /api/forecast/department-usage` - Department usage analysis

### Reports

- `GET /api/reports/monthly-usage` - Monthly usage report
- `GET /api/reports/department-distribution` - Department distribution
- `GET /api/reports/category-distribution` - Category analysis
- `GET /api/reports/export/:type` - Export reports

## 🔧 Customization

### Adding New Departments

1. Update `User.js` model enum
2. Add department to seed data
3. Update frontend department lists
4. Add department-specific styling

### Adding New Item Categories

1. Update `Item.js` model enum
2. Add sample items to seed data
3. Update frontend category filters

### Customizing AI Forecasting

1. Modify `forecastController.js` algorithms
2. Adjust risk assessment thresholds
3. Customize recommendation logic

## 🚨 Security Features

- **JWT Authentication**: Secure token-based sessions
- **Password Hashing**: Bcrypt encryption
- **Role-based Authorization**: Granular access control
- **Department Isolation**: Data segregation by department
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin request handling

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Check MongoDB URI in config
   - Ensure MongoDB is running
   - Verify network connectivity

2. **JWT Token Issues**

   - Check JWT_SECRET in environment
   - Clear browser localStorage
   - Restart server

3. **CORS Errors**

   - Verify frontend URL in CORS config
   - Check server is running on correct port

4. **Permission Denied Errors**
   - Verify user role and department
   - Check middleware configuration
   - Ensure proper authentication

### Debug Mode

Enable debug logging:

```javascript
// In server/app.js
app.use(morgan("dev"));
console.log("Debug mode enabled");
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for educational institutions**
