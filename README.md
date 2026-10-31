# Social-Ai

Social-Ai is a social media assistant built with React, Express, and MongoDB. It provides AI-powered content generation, brand profiles, social media publishing, authentication, and marketing analysis.

## Project Structure

```text
Social-Ai/
├── frontend/   # React application
└── server/     # Express API and MongoDB integration
```

## Prerequisites

Install the following before running the project:

- Node.js 18 or newer
- npm
- MongoDB or a MongoDB Atlas database
- Groq API key

Optional integrations require additional API credentials:

- YouTube Data API
- SerpAPI
- Meta/Instagram OAuth
- Google/YouTube OAuth

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Rahul3106/Social-Ai.git
cd Social-Ai
```

### 2. Install dependencies

```bash
cd server
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create a file named `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/social-ai
JWT_SECRET=replace_with_a_long_random_secret
GROQ_API_KEY=your_groq_api_key

BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Optional APIs
YOUTUBE_API_KEY=your_youtube_api_key
SERPAPI_KEY=your_serpapi_key
REDDIT_USER_AGENT=SocialAI/1.0

# Optional Instagram / Meta OAuth
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# Optional Google / YouTube OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Never commit `.env` files or API keys to GitHub.

### 4. Start MongoDB

Start your local MongoDB service, or use MongoDB Atlas and update `MONGO_URI` with your Atlas connection string.

### 5. Start the backend

Open a terminal and run:

```bash
cd server
node index.js
```

The backend will run at:

```text
http://localhost:5000
```

### 6. Start the frontend

Open a second terminal and run:

```bash
cd frontend
npm start
```

Open the application in your browser:

```text
http://localhost:3000
```

The frontend automatically proxies API requests to the backend at port `5000`.

## OAuth Callback URLs

For Instagram/Meta OAuth:

```text
http://localhost:5000/api/auth/instagram/callback
```

For Google/YouTube OAuth:

```text
http://localhost:5000/api/auth/youtube/callback
```

These callback URLs must also be configured in the relevant provider dashboards.

## Available Commands

### Frontend

```bash
cd frontend

npm start       # Start development server
npm test        # Run tests
npm run build   # Create production build
```

### Backend

```bash
cd server

node index.js   # Start API server
```

## Troubleshooting

### MongoDB connection error

Check that MongoDB is running and that `MONGO_URI` is correct.

### AI features are not working

Make sure `GROQ_API_KEY` exists in `server/.env`, then restart the backend.

### Frontend cannot connect to backend

Verify that:

- Backend is running on port `5000`
- Frontend is running on port `3000`
- The frontend proxy points to `http://localhost:5000`

### OAuth redirect error

Make sure the callback URL in the provider dashboard exactly matches the local callback URL configured above.

## Production Notes

Before deploying:

- Use a secure production `JWT_SECRET`
- Use a production MongoDB database
- Configure production frontend and backend URLs
- Store API keys in environment variables or a secret manager
- Replace localhost OAuth callback URLs with production URLs
- Do not expose `.env` files publicly
