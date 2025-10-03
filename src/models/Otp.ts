import mongoose, { Schema, Model } from 'mongoose';

export interface OtpDocument {
  email: string;
  otpHash: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
}

const OtpSchema = new Schema<OtpDocument>({
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
});

// TTL index: auto-delete documents after expiry time
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel: Model<OtpDocument> =
  (mongoose.models.Otp as Model<OtpDocument>) ||
  mongoose.model<OtpDocument>('Otp', OtpSchema, 'otps');


