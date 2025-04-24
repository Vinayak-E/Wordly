# Wordly 📰

**Wordly** is a full-featured, full-stack article feeds web application built with the modern MERN stack. It empowers users to register, personalize their content preferences, create and manage articles, and engage with community content through likes, dislikes, and blocks. The platform emphasizes user experience, secure authentication, and scalable architecture.

---

## ✨ Features

- 🔐 **User Authentication** – Secure registration and login with HTTP-only cookies
- 🎯 **Preference Management** – Tailored article feeds based on selected interests
- ✍️ **Article Management** – Create, update, and delete your own content
- 👍👎🚫 **Article Interaction** – Like, dislike, or block articles for a customized experience
- 🔍 **Filtering** – Browse articles by category
- 🖼️ **Image Upload** – Upload article images to AWS S3
- ⚙️ **Admin Dashboard** – Manage categories and monitor content
- 🛡️ **Secure & Scalable** – Built with best practices for security and performance

---

## 🧱 Tech Stack

### Frontend
- **React** (via Vite)
- **TypeScript**
- **Tailwind CSS**
- **Redux Toolkit & RTK Query**
- **React Hook Form** + **Zod** (for form handling and validation)

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **Multer** for file uploads
- **AWS S3** for cloud storage
- **Redis** *(optional, for caching or session management)*

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18 or above
- MongoDB Atlas or local MongoDB instance
- AWS S3 account and credentials
- Redis server *(optional)*
- Vercel (Frontend Hosting) & Render (Backend Hosting)

---

## 🚀 Local Development

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment variables:
   ```bash
   cp .env.example .env
   ```

4. Add your values to `.env` (see template below)

5. Start the backend server:
   ```bash
   npm run dev
   ```

### .env Example

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
S3_BUCKET_NAME=your_s3_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
CLIENT_URL=https://wordly-sand.vercel.app
```

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

Make sure the `CLIENT_URL` matches the frontend origin for CORS to work properly.

---

## 🌐 Deployment

- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Render](https://render.com)

> Ensure CORS is configured properly in Express:

```ts
app.use(cors({
  origin: ['http://localhost:5173', 'https://wordly-sand.vercel.app'],
  credentials: true,
}));
```

---



## 🙌 Contributing

We welcome contributions! Follow these steps:

1. Fork the repository
2. Create a new feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Add feature"`
4. Push to your branch: `git push origin feature-name`
5. Open a pull request

