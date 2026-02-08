# Yamazon 🛒

Yamazon is a modern e-commerce platform built with Node.js, Express, and PostgreSQL. It features a robust authentication system, a dynamic shopping cart, and a sleek user interface for a seamless shopping experience.

## 🚀 Features

- **User Authentication**: Secure signup and login using Passport.js and bcrypt for password hashing.
- **Dynamic Product Catalog**: Browse products organized by categories with real-time availability updates.
- **Shopping Cart**: Add products to your cart, manage quantities, and see your balance update dynamically.
- **Real-time Balance Management**: Users have a virtual balance that is updated when products are added to the cart or purchased.
- **Responsive Design**: A premium, mobile-friendly UI that looks great on all devices.
- **Order Processing**: Seamless checkout process that updates product stock and user balance.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Frontend**: EJS (Embedded JavaScript templates), Vanilla CSS, JavaScript
- **Security**: Passport.js (Local Strategy), bcrypt
- **Environment Management**: dotenv
- **Middleware**: body-parser, express-session

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [PostgreSQL](https://www.postgresql.org/) database setup

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd Yamazon
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your configuration:

   ```env
   DB_USER=your_db_user
   DB_HOST=your_db_host
   DB_DATABASE=your_db_name
   DB_PASSWORD=your_db_password
   DB_PORT=5432
   SESSION_SECRET=your_secret_key
   ```

4. **Database Initialization**:
   Ensure your PostgreSQL tables (`users`, `products`, `categories`, `cart`) are created based on the project schema.

### Running the App

- **Development Mode** (with Nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

The server will be running at `http://localhost:4000`.

## 📄 License

This project is licensed under the ISC License.
<img width="1347" height="526" alt="image" src="https://github.com/user-attachments/assets/40506911-663f-4daf-be76-d6b2b6775f3c" />

