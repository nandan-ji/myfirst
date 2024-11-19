"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pfdfupload = exports.upload = exports.s3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../../config");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(__dirname, "uploads");
// Function to clear the uploads directory
const clearUploadsFolder = () => {
    if (fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.readdirSync(uploadsDir).forEach((file) => {
            const filePath = path_1.default.join(uploadsDir, file);
            fs_1.default.unlinkSync(filePath); // Delete each file
        });
    }
};
exports.s3 = new client_s3_1.S3Client({ region: config_1.region,
    credentials: {
        accessKeyId: config_1.accessKeyId,
        secretAccessKey: config_1.secretAccessKey
    }
});
exports.upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: exports.s3,
        bucket: config_1.bucketName,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, "rnpschool" + Date.now().toString() + '-' + file.originalname);
        }
    })
});
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        clearUploadsFolder();
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});
// Initialize Multer with storage and file filter
exports.pfdfupload = (0, multer_1.default)({ storage });
