# SIMS Full-Stack Project

This repository now contains two sub-projects:

- `frontende-project`: React.js + Tailwind CSS user interface.
- `backend-project`: Node.js + Express + MySQL API.

## Features

- User account creation and login
- Encrypted passwords with `bcryptjs`
- Spare-part insert form
- Stock-in insert form
- Stock-out insert, retrieve, update, and delete
- Daily stock status report
- Daily stock-out report
- Frontend and backend communication with `axios`

## Folder Structure

```text
frontende-project/
backend-project/
```

## Backend Setup

1. Open MySQL and run [backend-project/sql/sims.sql](/c:/Users/user/Desktop/react-nambazamaria-giselle-national-practical-exam-2025/backend-project/sql/sims.sql:1).
2. In `backend-project`, create a `.env` file from `.env.example`.
3. Install packages with `npm install`.
4. Start the server with `npm run dev`.

## Frontend Setup

1. In `frontende-project`, install packages with `npm install`.
2. Start the React app with `npm run dev`.
3. Open the URL shown by Vite, usually `http://localhost:5173`.

## Notes

- Backend base URL is `http://localhost:5000/api`.
- The frontend stores the login token in local storage.
- Reports can be filtered by date from the report screen.
