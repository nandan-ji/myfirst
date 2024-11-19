"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappSendMediaController = exports.whatsappLogoutController = exports.whatsappsendSmsforuserController = exports.whatsappsendSmsController = exports.startWhatsappwEBController = void 0;
const http_errors_1 = require("http-errors");
const whatsappHelper_1 = require("./whatsappHelper");
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = require("../validation/utils/multer");
const whatsapp_web_js_1 = require("whatsapp-web.js");
const startWhatsappwEBController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id } = req.params;
    try {
        (0, whatsappHelper_1.startClient)(Id);
        res.send();
    }
    catch (error) {
        return next(http_errors_1.InternalServerError);
    }
});
exports.startWhatsappwEBController = startWhatsappwEBController;
const createWhatsAppID = (phoneNumber) => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Check if the number has exactly 10 digits
    if (/^\d{10}$/.test(cleaned)) {
        // Append the @c.us suffix for all valid IDs
        return `91${cleaned}@c.us`;
    }
    else {
        console.log(`Invalid phone number format: ${phoneNumber}`);
        return null; // Return null if the format is invalid
    }
};
const whatsappsendSmsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messages, numbers } = req.body; // Assuming messages and numbers are arrays and have the same length
    const { Id } = req.params;
    try {
        if (!Array.isArray(numbers) || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid input data" });
        }
        if (whatsappHelper_1.clients[Id]) {
            const promises = []; // Array to hold promises
            for (let index = 0; index < numbers.length; index++) {
                const phoneNumber = numbers[index];
                const message = messages[index];
                const wid = createWhatsAppID(phoneNumber);
                if (wid) {
                    // Push the promise returned by sendMessage() into the array
                    promises.push((0, whatsappHelper_1.sendMessage)(wid, message, Id));
                }
                else {
                    console.log(`Invalid phone number format: ${phoneNumber}`);
                }
            }
            // Wait for all messages to be sent 
            yield Promise.all(promises);
            return res.status(200).json({
                message: "SMS sent successfully",
            });
        }
        else {
            return res.status(201).json({
                message: "Authentication failed. Please log in to send SMS.",
            });
        }
    }
    catch (error) {
        if (error.message === 'Authentication failed') {
            return res.status(201).json({
                message: "Authentication failed. Please log in to send SMS.",
            });
        }
        return next(http_errors_1.InternalServerError); // Handle other errors
    }
});
exports.whatsappsendSmsController = whatsappsendSmsController;
const whatsappsendSmsforuserController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messages, numbers } = req.body; // Assuming messages and numbers are arrays and have the same length
    const { Id } = req.params;
    try {
        if (!Array.isArray(numbers) || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid input data" });
        }
        if (!whatsappHelper_1.clients[Id]) {
            return res.status(201).json({
                message: "Authentication failed. Please log in to send SMS.",
            });
        }
        else {
            for (let index = 0; index < numbers.length; index++) {
                const phoneNumber = numbers[index];
                const message = messages[index];
                const wid = createWhatsAppID(phoneNumber);
                if (wid) {
                    (0, whatsappHelper_1.sendMessage)(wid, message, Id);
                }
                else {
                    console.log(`Invalid phone number format: ${phoneNumber}`);
                }
            }
            return res.status(200).json({
                message: "SMS sent successfully",
            });
        }
        // Loop through the numbers array and send the corresponding message to each number
    }
    catch (error) {
        return next(http_errors_1.InternalServerError);
    }
});
exports.whatsappsendSmsforuserController = whatsappsendSmsforuserController;
const whatsappLogoutController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id } = req.params;
    try {
        const input = {
            "Bucket": "wtp-bucket",
            "Key": `whatsapp/RemoteAuth-${Id}.zip`
        };
        const command = new client_s3_1.DeleteObjectCommand(input);
        yield multer_1.s3.send(command);
        return res.status(200).json({
            message: "You’ve been logged out successfully. See you next time!",
        });
    }
    catch (error) {
        console.log(error);
        return next(http_errors_1.InternalServerError);
    }
});
exports.whatsappLogoutController = whatsappLogoutController;
const whatsappSendMediaController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { numbers } = req.body; // numbers and messages as arrays
    const { Id } = req.params;
    const mediaFiles = req.files; // Uploaded files
    try {
        if (!whatsappHelper_1.clients[Id]) {
            return res.status(401).json({
                message: "Authentication failed. Please log in to send media.",
            });
        }
        else {
            // Loop through numbers and send media with message
            for (let index = 0; index < numbers.length; index++) {
                const phoneNumber = numbers[index];
                const mediaFile = mediaFiles[index]; // Match media file by index
                // Create WhatsApp ID for the recipient
                const wid = createWhatsAppID(phoneNumber);
                if (wid && mediaFile) {
                    // Create media object from the uploaded file
                    const media = whatsapp_web_js_1.MessageMedia.fromFilePath(mediaFile.path);
                    // Send media
                    yield whatsappHelper_1.clients[Id].sendMessage(wid, media);
                }
                else {
                    console.log(`Invalid phone number or missing media file for index ${index}`);
                }
            }
            return res.status(200).json({
                message: "Media sent successfully.",
            });
        }
    }
    catch (error) {
        console.error("Error sending media:", error);
        return next(error);
    }
});
exports.whatsappSendMediaController = whatsappSendMediaController;
