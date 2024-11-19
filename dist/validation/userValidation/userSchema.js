"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.schoolSchema = {
    whatsappsmsValidations: joi_1.default.object({
        numbers: joi_1.default.array().max(4000).items(joi_1.default.string().required()).single(),
        messages: joi_1.default.array().max(4000).items(joi_1.default.string().required()).single(),
    }),
};
