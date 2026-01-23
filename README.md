# ProSafety Orders Management System

A modern order management system for tracking sample orders, purchase orders, and client management in manufacturing environments.

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)

## Features

- **Multi-Role System** - Separate Owner and Staff dashboards with role-based permissions
- **Order Management** - Comprehensive sample orders and purchase orders tracking
- **Advanced Filters** - Search, status, priority, client, and order type filters
- **Smart Alerts** - Due date warnings and payment reminders
- **Real-time Analytics** - Track orders, clients, and performance metrics
- **Modern UI** - Clean, responsive design with Tailwind CSS
- **Secure Authentication** - JWT-based authentication with role-based access control

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Axios  
**Backend:** Node.js, Express, MongoDB, JWT Authentication  
**Deployment:** Vercel (Frontend), Render (Backend)

## Deployment

### Vercel (Frontend)
1. Create `vercel.json` in frontend folder
2. Connect GitHub repository to Vercel
3. Set Root Directory to `frontend`
4. Add environment variables (API URL)
5. Deploy

### Render (Backend)
1. Create new Web Service
2. Connect GitHub repository
3. Set Root Directory to `backend`
4. Add environment variables (MongoDB URI, JWT Secret, etc.)
5. Deploy

## User Roles & Permissions

### Owner Dashboard
**Full Administrative Access:**
- Complete CRUD operations for **Clients** (Create, Read, Update, Delete)
- Complete CRUD operations for **Orders** (Sample & Purchase Orders)
- Complete CRUD operations for **Staff** accounts
- Reset staff passwords
- View all analytics and reports
- Full order status management
- Payment tracking and management

### Staff Dashboard
**Limited View & Update Access:**
- **View Only** access to Clients (cannot add, edit, or delete)
- **View Only** access to Orders (cannot add or delete)
- **Update Order Status** - Can modify order status (Pending, In Progress, Completed, etc.)
- **Cannot** view or manage other staff members
- **Cannot** perform CRUD operations on clients or orders
- **Cannot** modify payment details

## Main Features

### Dashboard Analytics
- Total clients, staff, and orders overview
- Active vs completed orders breakdown
- Order status distribution
- Due date alerts and pending payment notifications
- Real-time performance metrics

### Order Management

**Filtering Capabilities:**
- Search by order name, PO number, or client name
- Filter by order type (Sample/Purchase Order)
- Filter by status (Pending, In Progress, Completed, Cancelled)
- Filter by priority (Low, Medium, High)
- Filter by specific client

**Order Types:**
- **Sample Orders** - Production samples with priority tracking and quick turnaround
- **Purchase Orders** - Full production orders with detailed payment tracking and delivery schedules

### Client Management
- Comprehensive client database
- Contact information and order history
- Client-specific order filtering
- Quick access to client details

### Staff Management (Owner Only)
- Add and manage staff accounts
- Reset staff passwords
- Assign roles and permissions
- Track staff activity

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing
- Protected API endpoints
- Session management

## Responsive Design

- Fully responsive across all devices
- Mobile-friendly interface
- Touch-optimized controls
- Adaptive layouts for tablets and desktops

## License

MIT License - feel free to use this project!

## Author

Created by **Khizar Ameer**  
GitHub: [@khizr-ameer](https://github.com/khizr-ameer)

---

**Star this repository if you found it helpful!**
