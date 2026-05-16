# 💰 Smart Expense Tracker

A full-stack web application to manage and track daily expenses with secure authentication using **JWT (JSON Web Token)**.

---

## 📌 Overview

Smart Expense Tracker helps users manage their financial activities by tracking income and expenses efficiently. It provides a clean UI, categorized transactions, and secure API access.

---

## ✨ Features

- 🔐 User Registration & Login
- 🔑 JWT-based Authentication
- 💸 Add & Manage Expenses
- 📊 Dashboard with Income, Expense & Savings
- 🗂️ Category-based Tracking (Food, Travel, Shopping, etc.)
- 🔒 Secure APIs using Spring Security
- 🌐 Responsive UI with Tailwind CSS

---

## 🛠️ Tech Stack

- **Backend:** Java, Spring Boot, Spring Security, JPA
- **Frontend:** HTML, CSS (Tailwind), JavaScript
- **Database:** MySQL
- **Authentication:** JWT
- **Tools:** Maven, Git, GitHub, Postman

---

## 📂 Project Structure
com.pralhad.expense
├── config (Security & JWT Filter)
├── controller (REST APIs)
├── service (Business Logic)
├── repository (Database Layer)
├── model (Entities)
└── util (JWT Utility)


---

## 🔐 JWT Authentication Flow

1. User logs in with credentials  
2. Server generates JWT token  
3. Token stored in browser  
4. Token sent in API requests  
5. Backend validates token using JwtFilter  

---

## ⚙️ Setup Instructions

### 1. Clone Repository
git clone https://github.com/your-username/smart-expense-tracker.git


### 2. Configure Database
Update `application.properties`:
spring.datasource.url=jdbc:mysql://localhost:3306/expense_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update


### 3. Run Application
mvn spring-boot:run


### 4. Open in Browser
http://localhost:8080


---

## 🧪 API Testing

### Login
POST /auth/login

{
"username": "admin",
"password": "123"
}


### Protected API
GET /api/data


Header:
Authorization: Bearer <JWT_TOKEN>


---

## 🚀 Future Improvements

- 📈 Charts & Analytics
- 📱 Mobile Responsive UI
- 🔔 Notifications
- ☁️ AWS Deployment
- 👥 Role-based Authentication

---

## 👨‍💻 Author

**Pralhad Gaikwad**  
Java Developer | MCA Student  

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
