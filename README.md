# Social-Ai

Social-Ai is a social media assistant with a React frontend and an Express/MongoDB backend. It supports account authentication, brand profiles, AI-assisted content generation, content publishing, and marketing analysis.

## Project structure

```text
Social-Ai/
├── frontend/   # React application
└── server/     # Express API and MongoDB integration
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB (local MongoDB or a MongoDB Atlas cluster)
- A Groq API key for AI features

The YouTube, SerpAPI, Instagram, and Google integrations are optional. They require the corresponding API credentials described below.

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/Rahul3106/Social-Ai.git
cd Social-Ai
```

### 2. Install dependencies

Install dependencies separately for the frontend and backend:

```bash
cd server
npm install

cd ../frontend
npm install
```

### 3. Configure the backend environment

Create `server/.env`:

```env
# Required
MONGO_URI=mongodb://127.0.0.1:27017/social-ai
JWT_SECRET=replace_with_a_long_random_secret
GROQ_API_KEY=your_groq_api_key

# Local application URLs
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Optional: YouTube and marketing research
YOUTUBE_API_KEY=your_youtube_api_key
SERPAPI_KEY=your_serpapi_key
REDDIT_USER_AGENT=SocialAI/1.0

# Optional: Instagram / Meta OAuth
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# Optional: YouTube / Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Do not commit `.env` files or API keys. The backend uses port `5000`, and the frontend uses port `3000`.

### 4. Start MongoDB

If MongoDB is installed locally, start the MongoDB service using the command appropriate for your operating system. For MongoDB Atlas, use the connection string supplied by Atlas as `MONGO_URI`.

### 5. Start the backend

From the repository root:

```bash
cd server
node index.js
```

The API will be available at `http://localhost:5000`.

### 6. Start the frontend

Open a second terminal:

```bash
cd frontend
npm start
```

Open `http://localhost:3000` in your browser. The frontend is configured to proxy `/api` requests to the backend at `http://localhost:5000`.

## OAuth setup (optional)

For Instagram, configure the Meta application callback URL as:

```text
http://localhost:5000/api/auth/instagram/callback
```

For YouTube, configure the Google OAuth callback URL as:

```text
http://localhost:5000/api/auth/youtube/callback
```

The OAuth credentials must be added to `server/.env` before connecting accounts from the application.

## Available commands

### Frontend

```bash
cd frontend
npm start       # Start the development server
npm test        # Run tests
npm run build   # Create a production build
```

### Backend

```bash
cd server
node index.js   # Start the API server
```

## Troubleshooting

- **MongoDB connection error:** Check that MongoDB is running and that `MONGO_URI` is correct.
- **AI features fail:** Confirm that `GROQ_API_KEY` is present in `server/.env`, then restart the backend.
- **Frontend cannot reach the API:** Make sure the backend is running on port `5000` and the frontend is running on port `3000`.
- **OAuth redirect errors:** Confirm that the callback URL in the provider dashboard exactly matches the local callback URL above.

## Production notes

Before deploying, replace the development JWT secret, use a production MongoDB connection string, configure secure OAuth redirect URLs, and store credentials in the hosting provider's secret manager.
