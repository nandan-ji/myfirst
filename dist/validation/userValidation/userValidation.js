"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappSms = void 0;
const validator_1 = __importDefault(require("../utils/validator"));
const userSchema_1 = require("./userSchema");
//post validations
const whatsappSms = (req, res, next) => (0, validator_1.default)(userSchema_1.schoolSchema.whatsappsmsValidations, req.body, next);
exports.whatsappSms = whatsappSms;
