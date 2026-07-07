# Landmark Attendance

This repository contains a Node.js backend and a React web frontend.

## Run the merged app with Docker

From the repository root:

```bash
docker compose up --build
```

The backend image is built from `backend/Dockerfile` and includes the React frontend build from `frontend/edutrack-web`.

Open the merged app at:

```text
http://localhost:5000
```

## Environment

Required environment variables:

- `MYSQL_ROOT_PASSWORD`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`

Optional:

- `DB_HOST` (default: `db`)
- `DB_PORT` (default: `3306`)
- `DB_USER` (default: `landmark_user`)
- `DB_NAME` (default: `landmark_attendance`)
- `FRONTEND_URL` (default: `http://localhost:5000`)

## Notes

- `frontend/edutrack-web` is built during the Docker image build.
- Backend serves the built frontend from `frontend/edutrack-web/dist`.
