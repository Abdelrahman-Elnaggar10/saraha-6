import mongoose from "mongoose";
import userRepository from "../../DB/Repositories/user.repository.js";
import messageRepository from "../../DB/Repositories/message.repository.js";
import identityRequestRepository from "../../DB/Repositories/identity-request.repository.js";
import conversationRepository from "../../DB/Repositories/conversation.repository.js";
import chatMessageRepository from "../../DB/Repositories/chat-message.repository.js";
import HttpAppError from "../../Utils/Errors/app.error.js";
import { REQUEST_STATUS } from "../../Utils/constants.js";

const checkValidId = (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new HttpAppError("Invalid ID", 400, { id }, "INVALID_ID");
    }
};

const isSame = (a, b) => String(a) === String(b);

export const sendAnonymousMessage = async (senderId, { receiverEmail, content }) => {
    const receiver = await userRepository.findOneDocument({ email: receiverEmail.toLowerCase() });

    if (!receiver) {
        throw new HttpAppError("Receiver not found", 404, {}, "USER_NOT_FOUND");
    }
    if (isSame(receiver._id, senderId)) {
        throw new HttpAppError("You can not send a message to yourself", 400, {}, "SELF_MESSAGE");
    }

    const message = await messageRepository.createDocument({ sender: senderId, receiver: receiver._id, content });

    return { _id: message._id, receiver: receiver._id, content: message.content, createdAt: message.createdAt };
};

export const getReceivedMessages = async (userId) => {
    const messages = await messageRepository
        .findDocuments({ receiver: userId })
        .populate("sender", "firstName lastName email")
        .sort({ createdAt: -1 });

    const requests = await identityRequestRepository.findDocuments({ requester: userId });
    const conversations = await conversationRepository.findDocuments({ receiver: userId });

    return messages.map((message) => {
        const request = requests.find((r) => isSame(r.message, message._id));
        const conversation = conversations.find((c) => isSame(c.message, message._id));
        const revealed = request?.status === REQUEST_STATUS.ACCEPTED;

        return {
            _id: message._id,
            content: message.content,
            createdAt: message.createdAt,
            requestId: request?._id || null,
            requestStatus: request?.status || null,
            conversationId: conversation?._id || null,
            sender: revealed ? message.sender : null,
        };
    });
};

export const requestSenderIdentity = async (userId, messageId) => {
    checkValidId(messageId);

    const message = await messageRepository.findDocumentById(messageId);

    if (!message) {
        throw new HttpAppError("Message not found", 404, {}, "MESSAGE_NOT_FOUND");
    }
    if (!isSame(message.receiver, userId)) {
        throw new HttpAppError("This message is not yours", 403, {}, "FORBIDDEN");
    }

    const existing = await identityRequestRepository.findOneDocument({ message: message._id });

    if (existing) {
        throw new HttpAppError("You already sent a request for this message", 409, { status: existing.status }, "REQUEST_EXISTS");
    }

    return identityRequestRepository.createDocument({
        message: message._id,
        requester: userId,
        sender: message.sender,
    });
};

export const getReceivedRequests = (userId) => {
    return identityRequestRepository
        .findDocuments({ sender: userId })
        .populate("message", "content createdAt")
        .populate("requester", "firstName lastName")
        .sort({ createdAt: -1 });
};

export const respondToRequest = async (userId, requestId, status) => {
    checkValidId(requestId);

    const request = await identityRequestRepository.findDocumentById(requestId);

    if (!request) {
        throw new HttpAppError("Request not found", 404, {}, "REQUEST_NOT_FOUND");
    }
    if (!isSame(request.sender, userId)) {
        throw new HttpAppError("This request is not for you", 403, {}, "FORBIDDEN");
    }
    if (request.status !== REQUEST_STATUS.PENDING) {
        throw new HttpAppError("This request was already answered", 409, { status: request.status }, "REQUEST_ALREADY_ANSWERED");
    }

    const updatedRequest = await identityRequestRepository.findDocumentByIdAndUpdate(
        request._id,
        { status },
        { new: true }
    );

    if (status === REQUEST_STATUS.REJECTED) {
        return { request: updatedRequest, conversation: null };
    }

    const conversation = await conversationRepository.createDocument({
        message: request.message,
        sender: request.sender,
        receiver: request.requester,
    });

    return { request: updatedRequest, conversation };
};


const getMyConversation = async (userId, conversationId) => {
    checkValidId(conversationId);

    const conversation = await conversationRepository.findDocumentById(conversationId);

    if (!conversation) {
        throw new HttpAppError("Conversation not found", 404, {}, "CONVERSATION_NOT_FOUND");
    }
    if (!isSame(conversation.sender, userId) && !isSame(conversation.receiver, userId)) {
        throw new HttpAppError("You are not part of this conversation", 403, {}, "FORBIDDEN");
    }

    return conversation;
};

export const getMyConversations = (userId) => {
    return conversationRepository
        .findDocuments({ $or: [{ sender: userId }, { receiver: userId }] })
        .sort({ createdAt: -1 });
};

export const sendChatMessage = async (userId, conversationId, { content }) => {
    const conversation = await getMyConversation(userId, conversationId);

    return chatMessageRepository.createDocument({ conversation: conversation._id, sender: userId, content });
};

export const getChatMessages = async (userId, conversationId) => {
    const conversation = await getMyConversation(userId, conversationId);

    return chatMessageRepository
        .findDocuments({ conversation: conversation._id })
        .populate("sender", "firstName lastName")
        .sort({ createdAt: 1 });
};
