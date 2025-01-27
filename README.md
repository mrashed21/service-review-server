````markdown
# Service Provider API

This repository contains the backend code for a **Service Provider** application, built using **Node.js**, **Express.js**, and **MongoDB**. The API allows users to manage services, reviews, and authentication securely and efficiently.

---

## Client URL

The client-side application for this backend can be accessed at:

## **Client URL**: [Client URL](https://services-review.netlify.app/)

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [API Endpoints](#api-endpoints)
5. [Middleware](#middleware)
6. [Environment Variables](#environment-variables)
7. [Development](#development)
8. [Deployment](#deployment)
9. [License](#license)
10. [Acknowledgments](#acknowledgments)

---

## Features

- **User Authentication**:
  - Secure login and logout using JWT tokens stored as HTTP-only cookies.
- **User Management**:
  - Add new users and retrieve user details.
- **Service Management**:
  - Create, update, delete, and retrieve services.
  - Search and filter services by category or keyword.
  - Paginate results for services.
- **Reviews**:
  - Add, update, delete, and fetch reviews.
  - Retrieve reviews for specific services or users.
- **Security**:
  - Middleware for verifying JWT tokens to protect sensitive routes.

---

## Technologies Used

- **Node.js**: JavaScript runtime for backend development.
- **Express.js**: Lightweight web framework for building APIs.
- **MongoDB**: NoSQL database for data storage.
- **JWT (jsonwebtoken)**: Authentication and authorization.
- **dotenv**: For managing environment variables.
- **cookie-parser**: For parsing and managing cookies.
- **CORS**: For enabling cross-origin requests.

---

## Installation

### Prerequisites

- Node.js and npm installed on your machine.
- A MongoDB Atlas account or local MongoDB instance.
- A `.env` file with the following variables:

  ```env
  PORT=5000
  DB_USER=<your-mongodb-username>
  DB_PASS=<your-mongodb-password>
  JWT_SECRET=<your-jwt-secret>
  NODE_ENV=development
  ```
````

### Steps

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables in a `.env` file as described above.

4. Start the server:
   ```bash
   npm start
   ```

---

## API Endpoints

### **Authentication**

- **POST** `/jwt`  
  Generate a JWT token and set it as an HTTP-only cookie.  
  **Body**:

  ```json
  { "email": "user@example.com" }
  ```

- **POST** `/logout`  
  Clear the authentication cookie to log the user out.

---

### **User Management**

- **POST** `/users/add`  
  Add a new user.  
  **Body**:

  ```json
  {
    "email": "user@example.com",
    "name": "John Doe",
    "photoURL": "https://example.com/photo.jpg"
  }
  ```

- **GET** `/users`  
  Fetch all registered users.

---

### **Services**

- **GET** `/services`  
  Retrieve a list of services with optional search, category filter, and pagination.  
  **Query Parameters**:

  - `keyword` (optional): Filter by keyword.
  - `category` (optional): Filter by category.
  - `page` (default: 1): Page number.
  - `limit` (default: 8): Number of items per page.

- **GET** `/service/:id`  
  Retrieve the details of a specific service by its ID.

- **GET** `/services/featured`  
  Retrieve a list of featured services (default limit: 8).

- **POST** `/service/add`  
  Add a new service (requires JWT authentication).  
  **Body**: Service object.

- **PUT** `/service/update/:id`  
  Update a service by its ID.  
  **Body**: Updated fields.

- **DELETE** `/service/delete/:id`  
  Delete a service by its ID.

- **GET** `/service/me/:email`  
  Retrieve all services created by a specific user (requires JWT authentication).

---

### **Reviews**

- **GET** `/reviews/all`  
  Retrieve all reviews.

- **GET** `/reviews/:serviceId`  
  Retrieve all reviews for a specific service.

- **GET** `/reviews/me/:email`  
  Retrieve all reviews created by a specific user (requires JWT authentication).

- **POST** `/reviews/add`  
  Add a new review.  
  **Body**: Review object.

- **GET** `/review/:id`  
  Retrieve a specific review by its ID.

- **PUT** `/review/update/:id`  
  Update a review by its ID.  
  **Body**: Updated fields.

- **DELETE** `/review/delete/:id`  
  Delete a review by its ID.

---

## Middleware

### **JWT Verification**

Middleware function to verify and decode JWT tokens from cookies.  
Protects routes such as:

- `/service/add`
- `/service/me/:email`
- `/reviews/me/:email`

---

## Environment Variables

| Variable     | Description                                    |
| ------------ | ---------------------------------------------- |
| `PORT`       | Port number for the server (default: 5000).    |
| `DB_USER`    | MongoDB username.                              |
| `DB_PASS`    | MongoDB password.                              |
| `JWT_SECRET` | Secret key for signing JWT tokens.             |
| `NODE_ENV`   | Environment mode (`development`/`production`). |

---

## Development

### Run the Development Server

Start the server in development mode using:

```bash
npm run dev
```
