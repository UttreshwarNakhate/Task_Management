## Task Management Project

1. This is a Task Management web app where users can create, update, and manage their tasks efficiently. It has user authentication using JWT tokens with access and refresh tokens for secure and smooth login sessions.
2. Users can sign up and sign in securely.
3. After login, users get an access token (short-lived) and a refresh token (long-lived).
4. When the access token expires, the app automatically uses the refresh token to get a new access token without asking the user to login again.
5. Tasks are linked to the logged-in user and stored securely in the backend database.
6. The backend API is built with Node.js and Express, Typescript and uses MongoDB for data storage.
7. The frontend uses React with Typescript and manages tokens and user state in Redux.
8. Refresh tokens are securely saved and rotated in the database for better security.
9. Axios interceptors handle token expiration and refresh logic automatically.


# Frontend Setup
    1. npm install
    2. npm start

# Backend Setup
    1. npm install
    2. npm run dev