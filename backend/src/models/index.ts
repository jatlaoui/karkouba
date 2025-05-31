import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// --- Encryption Utility for API Keys ---
const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a_very_secret_key_of_32_chars_for_demo'; // Must be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// --- Interfaces for Mongoose Documents ---

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  state: any; // Stores the entire AIWritingJourneyState or a subset
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPromptTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: string;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserAPIKey extends Document {
  userId: mongoose.Types.ObjectId;
  modelId: string;
  encryptedKey: string;
  createdAt: Date;
  updatedAt: Date;
  getDecryptedKey(): string;
}

// --- Mongoose Schemas ---

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
import { HydratedDocument } from 'mongoose'; // Add this import

// ... existing code ...

UserSchema.pre('save', async function (this: HydratedDocument<IUser>, next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const ProjectSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  state: { type: Schema.Types.Mixed, required: true }, // Mixed type for flexible JSON
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserPromptTemplateSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: String, required: true },
  template: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserAPIKeySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  modelId: { type: String, required: true },
  encryptedKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Encrypt API key before saving
UserAPIKeySchema.pre('save', function (this: HydratedDocument<IUserAPIKey>, next) {
  if (this.isModified('encryptedKey')) {
    this.encryptedKey = encrypt(this.encryptedKey);
  }
  next();
});

// Method to decrypt API key
UserAPIKeySchema.methods.getDecryptedKey = function (): string {
  return decrypt(this.encryptedKey);
};

// --- Mongoose Models ---
export const User = mongoose.model<IUser>('User', UserSchema);
export const Project = mongoose.model<IProject>('Project', ProjectSchema);
export const UserPromptTemplate = mongoose.model<IUserPromptTemplate>('UserPromptTemplate', UserPromptTemplateSchema);
export const UserAPIKey = mongoose.model<IUserAPIKey>('UserAPIKey', UserAPIKeySchema);

export interface IAuthorStyle extends Document {
  authorName: string;
  styleAnalysis: {
    sentence_structure: string;
    vocabulary_richness: string;
    rhetorical_devices_density: string;
    dialogue_style: string;
    narrative_tone: string;
    pacing: string;
  };
  textExamples: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AuthorStyleSchema: Schema = new Schema({
  authorName: { type: String, required: true, unique: true },
  styleAnalysis: {
    sentence_structure: { type: String, required: true },
    vocabulary_richness: { type: String, required: true },
    rhetorical_devices_density: { type: String, required: true },
    dialogue_style: { type: String, required: true },
    narrative_tone: { type: String, required: true },
    pacing: { type: String, required: true },
  },
  textExamples: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const AuthorStyle = mongoose.model<IAuthorStyle>('AuthorStyle', AuthorStyleSchema);