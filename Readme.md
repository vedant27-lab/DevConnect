# DevConnect 🚀

DevConnect is a full-stack, microservices-based web application designed for developers to collaborate on projects, manage tasks, and communicate in real time.

## ✨ Features

* **User Authentication**: Secure user registration and login using JWT.
* **Project Management**: Create projects, add descriptions, and manage members.
* **Task Tracking**: Kanban-style board to add, update, and track tasks (`To Do`, `In Progress`, `Done`).
* **Real-time Chat**: A dedicated chat room for each project using WebSockets (Socket.io).
* **Microservices Architecture**: A scalable and maintainable backend split into dedicated services for Authentication, Projects, and Chat.

## 🛠️ Tech Stack

* **Frontend**: React.js, React Router, CSS
* **Backend**: Node.js, Express.js
* **Database**: MongoDB Atlas (Free Tier)
* **Real-time Communication**: Socket.io
* **Authentication**: JSON Web Tokens (JWT)
* **Testing**: Jest, Supertest
* **Deployment**:
    * Frontend on Vercel
    * Backend microservices on Render

## 🏛️ Architecture

The application uses a microservices architecture. Each service is an independent application with its own API, promoting separation of concerns and scalability.

+------------------+ +------------------------+ +---------------------+ | React Frontend | | | | | | (on Vercel) +<----->+ Auth Service +------> MongoDB (Users) | +------------------+ | (on Render) | | | | +------------------------+ +---------------------+ | | +------------------------+ +-------------------------+ +------------------>+ Project Service +------> MongoDB (Projects/Tasks)| | | (on Render) | | | | +------------------------+ +-------------------------+ | | +------------------------+ +------------------------+ +------------------>+ Chat Service +------> MongoDB (Messages) | | (on Render) | | | +------------------------+ +------------------------+

## 📦 Project Structure

devconnect/ ├── auth-service/ # Authentication microservice ├── chat-service/ # Real-time chat microservice ├── project-service/ # Project & task management microservice └── frontend/ # React client application


## ⚙️ Local Setup

(Detailed instructions are provided in the main project documentation.)

1.  **Prerequisites**: Node.js v18+, npm, Git.
2.  **Clone the repo**: `git clone <your-repo-url>`
3.  **Setup MongoDB Atlas**: Create a free cluster and get the connection string.
4.  **Configure Environment Variables**: Create `.env` files for each of the three backend services and the frontend.
5.  **Install Dependencies**: Run `npm install` in the root of each service (`auth-service`, `project-service`, `chat-service`) and `frontend`.
6.  **Run Services**:
    * `npm start` in each backend service directory.
    * `npm start` in the `frontend` directory.

## 🚀 Deployment

* The three backend services are deployed as separate "Web Services" on **Render**.
* The frontend is deployed as a "Project" on **Vercel**.

(Detailed instructions are provided in the main project documentation.)

## 🧪 Testing

Backend API tests for the Auth service are written with Jest and Supertest.

To run tests:
```bash
cd auth-service
npm test

---

### **2. Backend: Auth Service**

This service handles user registration, login, and token validation.

#### `devconnect/auth-service/package.json`
```json
{
  "name": "auth-service",
  "version": "1.0.0",
  "description": "Auth microservice for DevConnect",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "jest"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }