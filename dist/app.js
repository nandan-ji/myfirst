"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const config_1 = require("./config");
const errorHanlder_1 = require("./middleware/errorHanlder");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const smsRouter_1 = __importDefault(require("./routes/smsRouter"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = __importDefault(require("http"));
const socketIo_1 = require("./socketio/socketIo");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
(0, socketIo_1.initSocket)(server);
const root = path_1.default.normalize(__dirname + '../..');
app.set("views", path_1.default.join(root + "/views"));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(body_parser_1.default.json({ limit: '5mb' }));
app.use(body_parser_1.default.urlencoded({
    extended: true,
    // limit: process.env.REQUEST_LIMIT || '100kb',
}));
app.use(express_1.default.static(path_1.default.join(root, 'public')));
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.use("/", smsRouter_1.default);
app.use(() => {
    throw (0, http_errors_1.default)(404, "Route not found");
});
app.use(errorHanlder_1.errorHandler);
app.use((0, helmet_1.default)());
server.listen(config_1.PORT, () => {
    console.log(`Listening On PORT ${config_1.PORT}`);
});
