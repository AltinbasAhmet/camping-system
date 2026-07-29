# CampPal Security

- Secrets must only exist in `camping-system-backend/.env`; never commit or send this file.
- Generate `JWT_SECRET` with `openssl rand -hex 64`.
- Authentication uses an HttpOnly, SameSite=Strict cookie.
- Login, OTP, registration and password reset endpoints are rate limited.
- OTP values are cryptographically generated, bcrypt-hashed, expire after 10 minutes and lock after repeated failures.
- Production must use HTTPS and `NODE_ENV=production`.
- Only trusted frontend origins belong in `FRONTEND_URL`.
- SQLite/database files, uploads, logs and Git history are excluded from distributable archives.
- Rotate SMTP, Twilio and JWT credentials if they were ever shared in a ZIP or committed.
