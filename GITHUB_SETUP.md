# How to Setup GitHub OAuth for Comptracker

Follow these steps to configure GitHub Authentication for your application.

## 1. Create a GitHub OAuth App
1. Log in to your GitHub account.
2. Go to [Developer Settings > OAuth Apps](https://github.com/settings/developers).
3. Click on the **"New OAuth App"** button.

## 2. Register a New OAuth Application
Fill in the form with the following details:

- **Application Name**: `Comptracker` (or any name you prefer)
- **Homepage URL**: `http://localhost:5173`
- **Description**: (Optional) `Development version of Comptracker`
- **Authorization callback URL**: `http://localhost:5173/login`
    - *Important*: This must match the route where our frontend handles the token (the Login page).

Click **"Register application"**.

## 3. Get Your Credentials
Once registered, you will be taken to the application settings page.

1. **Client ID**: Copy the "Client ID" string.
2. **Client Secret**: Click **"Generate a new client secret"**. Copy the generated secret code.

## 4. Configure Your Project

### Backend (.env)
Open `e:\comptracker\.env` and paste your credentials:

```ini
GITHUB_CLIENT_ID=your_pasted_client_id
GITHUB_CLIENT_SECRET=your_pasted_client_secret
```

### Frontend (frontend/.env or .env)
The frontend communicates with GitHub directly for the initial redirect, so it needs the Client ID too.
Open `e:\comptracker\frontend\.env` (or create if missing) and add:

```ini
VITE_GITHUB_CLIENT_ID=your_pasted_client_id
```

## 5. Restart Servers
After saving the `.env` files, restart your development servers to load the new environment variables:

```bash
# Terminal 1 (Backend)
npm run server

# Terminal 2 (Frontend)
npm run dev
```

You should now be able to sign in with GitHub!
