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
exports.store = exports.clients = void 0;
exports.startClient = startClient;
exports.sendMessage = sendMessage;
const config_1 = require("../config");
const socketIo_1 = require("../socketio/socketIo");
const whatsapp_web_js_1 = require("whatsapp-web.js"); // Importing necessary types from whatsapp-web.jsz
const wwebjs_aws_s3_1 = require("wwebjs-aws-s3");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new client_s3_1.S3Client({
    region: config_1.region,
    credentials: {
        accessKeyId: config_1.accessKeyId,
        secretAccessKey: config_1.secretAccessKey,
    },
});
const putObjectCommand = client_s3_1.PutObjectCommand;
const headObjectCommand = client_s3_1.HeadObjectCommand;
const getObjectCommand = client_s3_1.GetObjectCommand;
const deleteObjectCommand = client_s3_1.DeleteObjectCommand;
const store = new wwebjs_aws_s3_1.AwsS3Store({
    bucketName: 'wtp-bucket',
    remoteDataPath: 'whatsapp',
    s3Client: s3,
    putObjectCommand,
    headObjectCommand,
    getObjectCommand,
    deleteObjectCommand
});
exports.store = store;
const clients = {};
exports.clients = clients;
function startClient(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const io = (0, socketIo_1.getIO)();
        try {
            console.log(`Starting client for ID: ${id}`);
            // Destroy the existing client session if it exists
            if (clients[id]) {
                console.log(`Destroying existing session for ID: ${id}`);
                yield clients[id].destroy();
            }
            // Initialize a new client  
            clients[id] = new whatsapp_web_js_1.Client({
                puppeteer: {
                    executablePath: "/usr/bin/google-chrome-stable",
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                },
                authStrategy: new whatsapp_web_js_1.RemoteAuth({
                    clientId: id.toString(),
                    store: store,
                    backupSyncIntervalMs: 600000
                }),
                // authStrategy: new LocalAuth({
                //     clientId: id.toString() // Ensure clientId is a string
                // }),
                webVersionCache: {
                    type: 'remote',
                    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
                },
                qrMaxRetries: 10,
            });
            // Initialize the client 
            yield clients[id].initialize();
            // Handle QR code generation
            clients[id].on('qr', (qr) => {
                io.to(id).emit('qrCode', { qr });
                console.log(`QR Code generated for ID: ${id}`);
            });
            // Handle client ready event
            clients[id].on('ready', () => {
                io.to(id).emit('readytogo', { message: 'Your app can now send WhatsApp messages.' });
                console.log(`Client ready for ID: ${id}`);
            });
            // Handle client authentication events
            clients[id].on('authenticated', () => {
                io.to(id).emit('authenticated', { message: 'Client authenticated successfully.' });
                console.log(`Client authenticated for ID: ${id}`);
            });
            clients[id].on('auth_failure', () => {
                io.to(id).emit('auth_failure', { message: 'Authentication failed.' });
                console.log(`Authentication failed for ID: ${id}`);
            });
            clients[id].on('remote_session_saved', () => {
                console.log(`remote_session_saved: ${id}`);
            });
            // Handle incoming messages
            clients[id].on('message', (msg) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (process.env.PROCESS_MESSAGE_FROM_CLIENT && msg.from !== 'status@broadcast') {
                        const contact = yield msg.getContact();
                        console.log(`Received message from ${msg.from}:`, contact);
                    }
                }
                catch (error) {
                    console.error(`Error processing message from ${msg.from}:`, error);
                }
            }));
        }
        catch (error) {
            io.to(id).emit('auth_failure', { message: 'Authentication failed.' });
            console.error(`Error starting client for ID ${id}:`, error);
        }
    });
}
function sendMessage(phoneNumber, message, clientId) {
    return new Promise((resolve, reject) => {
        try {
            const client = clients[clientId.toString()];
            client.sendMessage(phoneNumber, message)
                .then(() => {
                console.log(`Message sent to ${phoneNumber} successfully.`);
                resolve(); // Message sent successfully
            })
                .catch((error) => {
                const io = (0, socketIo_1.getIO)();
                io.to(clientId.toString()).emit('auth_failure', { message: 'Authentication failed.' });
                reject(new Error('Authentication failed')); // Reject promise on failure
            });
        }
        catch (error) {
            reject(error); // Reject promise on unexpected error
        }
    });
}
