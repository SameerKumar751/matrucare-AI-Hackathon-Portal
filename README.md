MatruCare AI – Hackathon Registration Portal

A full-stack MERN application designed to streamline hackathon participant registration, authentication, and team management through a secure and intuitive platform.

✨ Features

* User Authentication: Secure signup, login, and email verification using OTP.
* OTP Verification: Time-limited, single-use OTP with resend cooldown and attempt limits.
* User Dashboard: Personalized dashboard with profile and registration details.
* Hackathon Registration: Dynamic registration form with team management (1–5 members).
* Email Notifications: Automated OTP and registration confirmation emails using Nodemailer and Gmail SMTP.
* Secure Sessions: JWT authentication with HTTP-only cookies.
* Security: CSRF protection, rate limiting, input sanitization, and centralized error handling.
* Responsive UI: Modern, dark-themed interface designed for an engaging user experience.

🛠️ Tech Stack

Frontend

* React.js 18
* Vite
* Tailwind CSS
* React Router
* Axios
* Lucide Icons

Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Bcrypt
* Nodemailer

📁 Project Structure

matrucare-ai/
├── client/          # React frontend
├── server/          # Express backend
├── README.md
└── .gitignore

🚀 Getting Started

Prerequisites

* Node.js 18+
* MongoDB (Local or Atlas)
* Gmail account for email notifications

1. Clone the Repository

git clone https://github.com/SameerKumar751/matrucare-AI-Hackathon-Portal.git
cd matrucare-AI-Hackathon-Portal

2. Setup Backend

cd server
npm install

Create a .env file using .env.example and configure your environment variables.

PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

Start the backend:

npm run dev

3. Setup Frontend

Open another terminal:

cd client
npm install

Create a .env file if required and configure:

VITE_API_URL=

Start the frontend:

npm run dev

The application will be available at:

* Frontend: http://localhost:5173
* Backend: http://localhost:5000

📧 Email Configuration

MatruCare AI uses Nodemailer with Gmail SMTP for automated emails.

1. Enable 2-Step Verification on your Google Account.
2. Generate a Gmail App Password.
3. Configure EMAIL_USER and EMAIL_PASS in server/.env.

Emails use MatruCare AI as the sender display name and the configured Gmail account as the sender address.

Note: Never commit your .env file or expose your credentials publicly.

🧪 Testing

Backend tests:

cd server
npm run test:unit
npm run test:integration

Frontend production build:

cd client
npm run build

🌐 Deployment

The application can be deployed using:

* Frontend: Vercel / Netlify
* Backend: Render / Railway
* Database: MongoDB Atlas

Configure the appropriate environment variables before deployment.

👨‍💻 Developer

Sameer Kumar

* GitHub: @SameerKumar751
* LinkedIn: Sameer Kumar

⸻

⭐ If you find this project interesting, consider giving it a star!
