import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: 'free' | 'pro';
  generationsUsed: number;
  generationsLimit: number;
  // Razorpay fields
  razorpaySubscriptionId?: string;
  razorpayPaymentId?: string;
  razorpayCustomerId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'halted';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, trim: true },
    photoURL: { type: String },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    generationsUsed: { type: Number, default: 0 },
    generationsLimit: { type: Number, default: 5 },
    razorpaySubscriptionId: { type: String, sparse: true },
    razorpayPaymentId: { type: String, sparse: true },
    razorpayCustomerId: { type: String, sparse: true },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'halted'],
    },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.virtual('canGenerate').get(function (this: IUser) {
  if (this.plan === 'pro') return true;
  return this.generationsUsed < this.generationsLimit;
});

export const User = mongoose.model<IUser>('User', UserSchema);
