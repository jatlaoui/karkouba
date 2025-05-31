"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/arabic-novel-writer';
        await mongoose_1.default.connect(mongoUri);
        console.log('MongoDB connected successfully.');
    }
    catch (error) {
        console.warn('MongoDB connection failed, running in demo mode without database:', error instanceof Error ? error.message : String(error));
        // Don't exit the process, continue without database for demo purposes
    }
};
exports.connectDB = connectDB;
