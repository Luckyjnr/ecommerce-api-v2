
# E-commerce API v2
## Description
A comprehensive e-commerce API built with Node.js and Express.js, implementing core e-commerce features including user authentication, product management, cart operations, and order processing with payment simulation.

## 🚀 Features Implemented

### User Authentication with JWT
- ✅ User registration with password hashing
- ✅ User login with JWT token generation
- ✅ Protected routes with authentication middleware
- ✅ Role-based access control (Customer/Admin)

### Products CRUD Operations
- ✅ List all products with pagination and filtering
- ✅ View individual product details
- ✅ Create products (Customer/Admin only)
- ✅ Update products (Customer/Admin only)
- ✅ Delete products (Customer/Admin only)
- ✅ Product search and category filtering

### Cart Management
- ✅ Add products to cart with stock validation
- ✅ View user's cart with populated product details
- ✅ Update item quantities
- ✅ Remove items from cart
- ✅ Clear entire cart
- ✅ Prevent exceeding stock limits

### Order Processing & Payment Simulation
- ✅ Create orders from cart items
- ✅ Payment simulation with 80% success rate
- ✅ Order status tracking
- ✅ View user's order history
- ✅ View individual order details
- ✅ Automatic stock deduction on successful payment

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
ecommerce-api-v2/
├── config/
│   ├── database.js          # MongoDB connection
│   └── jwt.js              # JWT configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── productController.js # Product management
│   ├── cartController.js    # Cart operations
│   └── orderController.js   # Order processing
├── middleware/
│   └── auth.js             # Authentication middleware
├── models/
│   ├── User.js             # User schema
│   ├── Product.js          # Product schema
│   ├── Cart.js             # Cart schema
│   └── Order.js            # Order schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── products.js         # Product routes
│   ├── cart.js             # Cart routes
│   └── orders.js           # Order routes
├── utils/
│   └── payment.js          # Payment simulation
├── app.js                  # Express app configuration
├── server.js               # Server startup
└── package.json            # Dependencies
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/<your-username>/ecommerce-api-v2.git

# Navigate to project directory
cd ecommerce-api-v2

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce-api-v2
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Running the Application

```bash
# Start the development server
npm start

# Or use nodemon for development
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Endpoints Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=10&category=electronics&search=phone
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Create Product (Authenticated)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced features",
  "price": 999.99,
  "category": "electronics",
  "stock": 50,
  "image": "https://example.com/image.jpg"
}
```

#### Update Product (Authenticated)
```http
PATCH /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 899.99
}
```

#### Delete Product (Authenticated)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Cart Endpoints

#### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 2
}
```

#### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Update Cart Item
```http
PATCH /api/cart/update/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /api/cart/remove/:productId
Authorization: Bearer <token>
```

#### Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer <token>
```

### Order Endpoints

#### Create Order (Checkout)
```http
POST /api/orders/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "paymentData": {
    "amount": 1999.98,
    "currency": "USD",
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}
```

#### Get User Orders
```http
GET /api/orders?page=1&limit=10&status=confirmed
Authorization: Bearer <token>
```

#### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## 💳 Payment Simulation

The API includes a payment simulation system with:
- **80% success rate** - Simulates real-world payment processing
- **2-second delay** - Mimics actual payment gateway response time
- **Comprehensive validation** - Validates payment data before processing
- **Error handling** - Proper error responses for failed payments

## 📊 Data Models

### User Model
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (customer/admin)
- `isActive` - Account status

### Product Model
- `name` - Product name
- `description` - Product description
- `price` - Product price
- `category` - Product category
- `stock` - Available quantity
- `image` - Product image URL
- `createdBy` - User who created the product

### Cart Model
- `user` - Cart owner
- `items` - Array of cart items
- `totalAmount` - Calculated total

### Order Model
- `user` - Order owner
- `orderNumber` - Unique order identifier
- `items` - Ordered products
- `totalAmount` - Order total
- `status` - Order status
- `paymentStatus` - Payment status
- `shippingAddress` - Delivery address

## 🧪 Testing

### Using Postman

1. **Health Check**: `GET http://localhost:3000/api/health`
2. **Register User**: `POST http://localhost:3000/api/auth/signup`
3. **Login**: `POST http://localhost:3000/api/auth/login`
4. **Create Product**: `POST http://localhost:3000/api/products`
5. **Add to Cart**: `POST http://localhost:3000/api/cart/add`
6. **Checkout**: `POST http://localhost:3000/api/orders/checkout`

### Sample Test Data

```json
// User Registration
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "customer"
}

// Product Creation
{
  "name": "Test Product",
  "description": "A test product for API testing",
  "price": 29.99,
  "category": "electronics",
  "stock": 100,
  "image": "https://via.placeholder.com/300x300?text=Test+Product"
}
```

## 🚀 Deployment

### Environment Variables for Production

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce-api-v2
JWT_SECRET=your-super-secure-jwt-secret-key
NODE_ENV=production
```

### Production Considerations

- Use a secure JWT secret
- Set up proper MongoDB connection string
- Configure CORS for your frontend domain
- Set up proper error logging
- Use environment-specific configurations

## 📝 Task 62A Completion Checklist

- ✅ **User Authentication with JWT**: Signup, login, middleware
- ✅ **Products CRUD**: All operations implemented
- ✅ **Cart Management**: Add, remove, update, view cart
- ✅ **Order Processing**: Checkout with payment simulation
- ✅ **Payment Simulation**: 80% success rate implementation
- ✅ **RESTful API Design**: Proper HTTP methods and status codes
- ✅ **Input Validation**: Comprehensive validation for all endpoints
- ✅ **Error Handling**: Proper error responses and logging
- ✅ **Database Integration**: MongoDB with Mongoose ODM
- ✅ **Security**: Password hashing, JWT authentication

## 👨‍💻 Author

**NOAH LUCKY**

## 📄 License

This project is licensed under the ISC License.
