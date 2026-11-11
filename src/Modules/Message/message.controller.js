import { Router } from 'express';
import * as messageService from "./anonymous-message.service.js";
import { sendMessageSchema, respondToRequestSchema, chatMessageSchema } from "./message.validation.js";
import { validate } from "../../Middlewares/validation.middleware.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
const messageController = Router();

messageController.get('/health' , (req, res) => {
    res.status(200).json({ message: 'Message service is helathy' });
});

messageController.use(authentication);

messageController.post("/send", validate(sendMessageSchema), async (req, res) => {
    const data = await messageService.sendAnonymousMessage(req.user._id, req.body);

    return res.status(201).json({ message: "Message sent successfully", data });
});

messageController.get("/received", async (req, res) => {
    const data = await messageService.getReceivedMessages(req.user._id);

    return res.status(200).json({ message: "Messages retrieved successfully", data });
});

messageController.get("/requests", async (req, res) => {
    const data = await messageService.getReceivedRequests(req.user._id);

    return res.status(200).json({ message: "Requests retrieved successfully", data });
});

messageController.patch("/requests/:requestId", validate(respondToRequestSchema), async (req, res) => {
    const data = await messageService.respondToRequest(req.user._id, req.params.requestId, req.body.status);

    return res.status(200).json({ message: `Request ${req.body.status} successfully`, data });
});

messageController.get("/conversations", async (req, res) => {
    const data = await messageService.getMyConversations(req.user._id);

    return res.status(200).json({ message: "Conversations retrieved successfully", data });
});

messageController.post("/conversations/:conversationId/messages", validate(chatMessageSchema), async (req, res) => {
    const data = await messageService.sendChatMessage(req.user._id, req.params.conversationId, req.body);

    return res.status(201).json({ message: "Message sent successfully", data });
});

messageController.get("/conversations/:conversationId/messages", async (req, res) => {
    const data = await messageService.getChatMessages(req.user._id, req.params.conversationId);

    return res.status(200).json({ message: "Conversation messages retrieved successfully", data });
});

messageController.post("/:messageId/request-identity", async (req, res) => {
    const data = await messageService.requestSenderIdentity(req.user._id, req.params.messageId);

    return res.status(201).json({ message: "Request sent successfully", data });
});

export default messageController;