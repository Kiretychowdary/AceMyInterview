# Supabase Google OAuth Configuration Guide

## Step 1: Enable Google OAuth in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers** 
3. Find **Google** and click **Enable**

## Step 2: Configure Google OAuth Settings

### In Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
5. Choose **Web application** as application type
6. Add these **Authorized redirect URIs**:
   - `https://exzesygjgprxiuqozjns.supabase.co/auth/v1/callback`
   - `http://localhost:5174/` (for development)

### Back in Supabase Dashboard:
1. Copy the **Client ID** and **Client Secret** from Google Cloud Console
2. Paste them into the Google provider settings in Supabase
3. In **Site URL** field, add: `http://localhost:5174` (for development)
4. In **Redirect URLs** field, add: `http://localhost:5174`
5. Click **Save**

## Step 3: Test the Authentication

1. Make sure your development server is running on port 5174
2. Visit the Register page (`/register`)
3. Click **Sign up with Google**
4. Complete the Google OAuth flow
5. You should be redirected back to your application and logged in

## Important Notes:

- **For Production**: Replace `localhost:5174` with your actual domain
- **Environment Variables**: Make sure your `.env` file has the correct Supabase URL and anon key
- **PKCE Flow**: The authentication is configured to use PKCE flow for enhanced security

## Troubleshooting:

- If you get redirect URI mismatch errors, double-check the URIs in Google Cloud Console
- If authentication doesn't work, verify the Client ID and Secret are correctly entered in Supabase
- Check the browser console for any error messages

## Current Implementation:

✅ Supabase client configured with proper OAuth settings
✅ AuthContext supports both email and Google authentication  
✅ Login page has both email and Google sign-in options
✅ Register page uses Google OAuth only for new signups
✅ Proper error handling and loading states