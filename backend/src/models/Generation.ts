import mongoose, { Schema, Document } from 'mongoose';

export type CodeType =
  | 'html-website'
  | 'react-component'
  | 'nextjs-page'
  | 'node-express-api'
  | 'python-script'
  | 'arduino-code'
  | 'full-stack';

export interface IGeneration extends Document {
  userId: string;
  prompt: string;
  codeType: CodeType;
  generatedCode: string;
  language: string;
  explanation?: string;
  tokensUsed: number;
  durationMs: number;
  isFavorited: boolean;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const GenerationSchema = new Schema<IGeneration>(
  {
    userId: { type: String, required: true, index: true },
    prompt: { type: String, required: true, maxlength: 2000 },
    codeType: {
      type: String,
      enum: ['html-website', 'react-component', 'nextjs-page', 'node-express-api', 'python-script', 'arduino-code', 'full-stack'],
      required: true,
    },
    generatedCode: { type: String, required: true },
    language: { type: String, required: true },
    explanation: { type: String },
    tokensUsed: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    isFavorited: { type: Boolean, default: false },
    title: { type: String, required: true, maxlength: 200 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for efficient user history queries
GenerationSchema.index({ userId: 1, createdAt: -1 });

export const Generation = mongoose.model<IGeneration>('Generation', GenerationSchema);
