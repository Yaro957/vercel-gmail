# Serverless OTP Email Service (Vercel)

## Overview

This service generates and sends OTP codes via email for authentication flows. OTPs are securely stored in MongoDB and delivered using Gmail SMTP **via a proxy server**.

## How Email Delivery Works

- The Vercel serverless function does **not** connect directly to Gmail SMTP.
- Instead, it sends an HTTPS request to a proxy server (e.g., on a VPS) with the OTP email data.
- The proxy server connects to Gmail SMTP (ports 465/587) and sends the email.
- The proxy returns a success/failure response, which is forwarded to the frontend.

## Environment Variables

Set these in your Vercel project:

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name
- `PROJECT_NAME` - Used in email subject
- `OTP_SECRET` - Secret for OTP hashing
- `PROXY_SERVER_URL` - HTTPS URL of your proxy server (e.g., `https://your-proxy.example.com`)

**Remove any SendGrid/Resend-specific variables.**

## API Endpoint

### `POST /api/send-otp`

**Request Payload:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
// Success
{
  "success": true,
  "message": "OTP sent successfully"
}

// Failure
{
  "success": false,
  "message": "Failed to send OTP email via proxy"
}
```

## Proxy Server

- The proxy server should expose an endpoint (e.g., `/send-email`) that accepts:
  - `to`: recipient email
  - `subject`: email subject
  - `body`: email body
- The proxy handles Gmail SMTP and returns `{ success: true/false, message: "..." }`.

## Example Proxy Request

```json
POST https://your-proxy.example.com/send-email
{
  "to": "user@example.com",
  "subject": "Your OTP Code",
  "body": "Your OTP code is: 123456. It expires in 5 minutes."
}
```

## Notes

- OTP generation, hashing, and MongoDB storage remain unchanged.
- TTL index ensures expired OTPs are cleaned up.
- All email delivery is handled via the proxy server.

## Troubleshooting

- Ensure `PROXY_SERVER_URL` is set and reachable from Vercel.
- Check proxy server logs for SMTP errors.
