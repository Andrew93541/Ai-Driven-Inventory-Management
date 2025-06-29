# 🔐 Login Troubleshooting Guide

## Quick Test

1. **Open the test page**: Open `test-login.html` in your browser
2. **Click Login**: The form is pre-filled with admin credentials
3. **Check the result**: You should see a success message

## Demo Credentials

| Role        | Email               | Password   |
| ----------- | ------------------- | ---------- |
| **Admin**   | admin@college.edu   | admin123   |
| **Staff**   | staff@college.edu   | staff123   |
| **Library** | library@college.edu | library123 |
| **Sports**  | sports@college.edu  | sports123  |

## Common Issues & Solutions

### 1. "Network Error" or "Server not running"

- **Solution**: Make sure the server is running
  ```bash
  cd server
  npm run dev
  ```
- **Check**: Visit `http://localhost:5000/health` in your browser

### 2. "Invalid email or password"

- **Solution**: The database might not be seeded
  ```bash
  cd server
  node seed.js
  ```

### 3. CORS Error

- **Solution**: The server is configured to allow localhost origins
- **Alternative**: Open the main application at `client/index.html`

### 4. "API endpoint not found"

- **Solution**: Make sure you're using the correct URL
- **Correct URL**: `http://localhost:5000/api/auth/login`

## Testing Steps

1. **Start the server**:

   ```bash
   cd server
   npm run dev
   ```

2. **Seed the database** (if not done already):

   ```bash
   cd server
   node seed.js
   ```

3. **Test login**:

   - Open `test-login.html` in your browser
   - Or open `client/index.html` and try logging in

4. **Check browser console** for any JavaScript errors

## Expected Response

When login is successful, you should see:

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@college.edu",
    "role": "admin",
    "department": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## If Still Having Issues

1. **Check server logs** for any errors
2. **Clear browser cache** and try again
3. **Try a different browser**
4. **Check if MongoDB is running** (if using local MongoDB)
5. **Verify the API URL** in the browser's Network tab

## Server Status Check

Visit these URLs to verify the server is working:

- `http://localhost:5000/health` - Should show server status
- `http://localhost:5000/api/auth/login` - Should return 404 (POST only)
