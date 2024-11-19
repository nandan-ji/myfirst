"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../validation/utils/multer");
const userValidation_1 = require("../validation/userValidation/userValidation");
const whasappController_1 = require("../controllers/whasappController");
const router = (0, express_1.Router)();
// // Route for creating or updating a vehicle
// router.get("/start",upload.none(),apiLimitMiddleware,authChecker,adminApiKeyMiddleware,startWhatsappwEBController);
// router.post("/send-sms",upload.none(),apiLimitMiddleware,authChecker,adminApiKeyMiddleware,sendSmsController);
router.get("/wb-start/:Id", multer_1.upload.none(), whasappController_1.startWhatsappwEBController);
router.post("/send-whatsapp-sms/:Id", multer_1.upload.none(), userValidation_1.whatsappSms, whasappController_1.whatsappsendSmsController);
router.post("/whatsapp-sms-user/:Id", multer_1.upload.none(), userValidation_1.whatsappSms, whasappController_1.whatsappsendSmsforuserController);
router.post("/whatsapp-file/:Id", multer_1.pfdfupload.array("mediaFile"), userValidation_1.whatsappSms, whasappController_1.whatsappSendMediaController);
router.delete("/whatsapp-logout/:Id", whasappController_1.whatsappLogoutController);
exports.default = router;
