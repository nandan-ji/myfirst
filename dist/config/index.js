"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucketName = exports.region = exports.secretAccessKey = exports.accessKeyId = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = parseInt(process.env.PORT);
exports.accessKeyId = process.env.AWS_ACCESS_KEY;
exports.secretAccessKey = process.env.AWS_SECRET_KEY;
exports.region = process.env.AWS_BUCKET_REGION;
exports.bucketName = process.env.AWS_BUCKET_NAME;
