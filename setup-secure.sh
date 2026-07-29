#!/bin/sh
set -eu
ENV_FILE="camping-system-backend/.env"
if [ -f "$ENV_FILE" ]; then
  echo "$ENV_FILE already exists; it was not overwritten."
else
  SECRET="$(openssl rand -hex 64)"
  cat > "$ENV_FILE" <<ENV
DATABASE_URL="file:./dev.db"
JWT_SECRET="$SECRET"
PORT=5050
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM="CampPal <noreply@camppal.com>"
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
TWILIO_MESSAGING_SERVICE_SID=
ENV
  chmod 600 "$ENV_FILE"
  echo "Secure local environment file created: $ENV_FILE"
fi

echo "Starting CampPal..."
docker compose up --build -d
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5050"
