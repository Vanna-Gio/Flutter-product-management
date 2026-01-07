# Backend API - Product Management System

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- SQL Server (2016 or higher)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your database credentials

3. Create database:
   - Run the SQL script in `/sql/01_create_database.sql`

4. Start server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP

### Testing Authentication

**Sign Up:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```


### Products (Protected - Requires JWT Token)
- `POST /api/products` - Create new product
- `GET /api/products` - Get all products (supports pagination, sorting, search, filtering)
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Product Query Parameters
- `search` - Search by product name or category name (supports Khmer & English)
- `category_id` - Filter by category ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort_by` - Sort field: `name`, `price`, `created_at` (default: name)
- `order` - Sort order: `ASC` or `DESC` (default: ASC)

#### Examples:
```bash
# Get all products
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search products
curl -X GET "http://localhost:3000/api/products?search=phone" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Sort by price descending
curl -X GET "http://localhost:3000/api/products?sort_by=price&order=DESC" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by category
curl -X GET "http://localhost:3000/api/products?category_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combined query
curl -X GET "http://localhost:3000/api/products?search=phone&category_id=1&sort_by=price&order=ASC&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```