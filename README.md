# 💳 Digital Wallet System

A secure and scalable digital wallet system built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**, featuring role-based access (`Admin`, `User`, `Agent`), JWT authentication, automatic wallet creation, and complete money transaction features.

---

## 📦 Features

- ✅ JWT-based secure authentication
- 🧑‍💼 Roles: `ADMIN`, `SUPER_ADMIN`, `AGENT`, `USER`
- 💼 Automatic wallet creation upon registration
- 💰 Add money, send money, withdraw, and agent-based cash-in/cash-out
- 🔐 Block/Activate wallets and agents
- 📜 Full transaction tracking
- 📊 Admin dashboard with filtering & pagination
- 🧩 Clean, modular architecture using Service-Controller-Repository pattern

---

## ⚙️ Setup & Environment Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/adibahbab4108/digital-wallet-system.git
cd digital-wallet-system
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file based on `.env.example` and configure your environment variables.

### 4. Run the Application

* Development:

  ```bash
  npm run dev
  ```
* Production:

  ```bash
  npm run build
  npm start
  ```

---

## 📌 API Endpoints Summary

### 🔐 Authentication

* **POST** `/api/v1/auth/login`
  Example:

  ```json
  {
    "email": "super.admin@gmail.com",
    "password": "super.admin"
  }
  ```

* **POST** `/api/v1/auth/register`

---

### 💼 Wallet Routes

* **POST** `/api/v1/wallet/add-money`

* **GET** `/api/v1/wallet/my-wallet` *(Requires Login)*

* **POST** `/api/v1/wallet/withdraw`

* **POST** `/api/v1/wallet/send-money`
  Example:

  ```json
  {
    "receiverId": "688de9805e53f19687ce8bd4",
    "amount": 200
  }
  ```

* **POST** `/api/v1/wallet/cash-in`
  Example:

  ```json
  {
    "receiverId": "688f3cd491e7efc2e568aecf",
    "amount": 2000
  }
  ```

* **POST** `/api/v1/wallet/cash-out`
  Example:

  ```json
  {
    "receiverId": "688f3cd491e7efc2e568aecf",
    "amount": 200
  }
  ```

---

### 🛡️ Admin Management

* **GET** `/api/v1/admin/transactions?limit=10&page=2`

* **PATCH** `/api/v1/admin/user/:userId/update-wallet`

* **PATCH** `/api/v1/admin/agent/:userId/update-approval`
  Example:

  ```json
  {
    "agentStatus": "APPROVED"
  }
  ```

* **GET** `/api/v1/admin/all-users`

* **GET** `/api/v1/admin/all-wallets`

---

## 🗂️ Project Structure

```
src/
├── app.ts
├── config/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── wallet/
│   ├── transaction/
│   ├── admin/
├── middlewares/
├── utils/
├── constants/
├── interfaces/
└── server.ts
```

---

## 🔒 Security and Best Practices

* 🔐 Passwords securely hashed using `bcrypt`
* 🔧 Environment configuration with `dotenv`
* 👮‍♂️ Role-based route protection
* 💡 Atomic operations using Mongoose transaction sessions
* 🧼 Clean modular architecture with DTOs and services

---

## 📞 Contact

For questions or contributions, feel free to reach out:

📧 **Email**: [adib.abc2022@gmail.com](mailto:adib.abc2022@gmail.com)
