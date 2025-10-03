import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { connectToDatabase } from '../src/lib/db';
import { OtpModel } from '../src/models/Otp';
import { generateNumericOtp, hashOtp } from '../src/utils/otp';

const PROXY_SERVER_URL = process.env.PROXY_SERVER_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid email' });
  }

  try {
    await connectToDatabase(process.env.MONGODB_URI!);
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    if (!process.env.OTP_SECRET) {
      throw new Error('OTP_SECRET is not defined in environment variables');
    }
    if (!PROXY_SERVER_URL) {
      throw new Error('PROXY_SERVER_URL is not defined in environment variables');
    }
    // Generate OTP and hash
    const otp = generateNumericOtp();
    const hashedOtp = hashOtp(otp, email);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Upsert OTP in MongoDB
    await OtpModel.findOneAndUpdate(
      { email },
      {
        email,
        otp: hashedOtp,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Prepare email data for proxy
    const emailPayload = {
      to: email,
      subject: `${process.env.PROJECT_NAME || 'Your'} OTP Code`,
      body: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
    };

    // Send HTTPS request to proxy server for Gmail SMTP delivery
    // --- Proxy integration starts here ---
    const proxyResponse = await axios.post(`${PROXY_SERVER_URL}/send-email`, emailPayload, {
      timeout: 10000,
    });
    // --- Proxy integration ends here ---

    if (proxyResponse.data && proxyResponse.data.success) {
      return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } else {
      return res.status(500).json({
        success: false,
        message: proxyResponse.data?.message || 'Failed to send OTP email via proxy',
      });
    }
  } catch (err: any) {
    // Error handling for proxy or other failures
    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || err.message || 'Internal server error',
    });
  }
}