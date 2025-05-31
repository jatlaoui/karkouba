"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorStyle = exports.UserAPIKey = exports.UserPromptTemplate = exports.Project = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
// --- Encryption Utility for API Keys ---
const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a_very_secret_key_of_32_chars_for_demo'; // Must be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16
function encrypt(text) {
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}
function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto_1.default.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
// --- Mongoose Schemas ---
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
// ... existing code ...
UserSchema.pre('save', async function (next) {
    if (this.isModified('passwordHash')) {
        this.passwordHash = await bcrypt_1.default.hash(this.passwordHash, 10);
    }
    next();
});
// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt_1.default.compare(candidatePassword, this.passwordHash);
};
const ProjectSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    state: { type: mongoose_1.Schema.Types.Mixed, required: true }, // Mixed type for flexible JSON
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const UserPromptTemplateSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: String, required: true },
    template: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const UserAPIKeySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    modelId: { type: String, required: true },
    encryptedKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
// Encrypt API key before saving
UserAPIKeySchema.pre('save', function (next) {
    if (this.isModified('encryptedKey')) {
        this.encryptedKey = encrypt(this.encryptedKey);
    }
    next();
});
// Method to decrypt API key
UserAPIKeySchema.methods.getDecryptedKey = function () {
    return decrypt(this.encryptedKey);
};
// --- Mongoose Models ---
exports.User = mongoose_1.default.model('User', UserSchema);
exports.Project = mongoose_1.default.model('Project', ProjectSchema);
exports.UserPromptTemplate = mongoose_1.default.model('UserPromptTemplate', UserPromptTemplateSchema);
exports.UserAPIKey = mongoose_1.default.model('UserAPIKey', UserAPIKeySchema);
const AuthorStyleSchema = new mongoose_1.Schema({
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
exports.AuthorStyle = mongoose_1.default.model('AuthorStyle', AuthorStyleSchema);
