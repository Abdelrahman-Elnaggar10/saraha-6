import ChatMessage from "../Models/chat-message.model.js";
import BaseRepository from "./base.repository.js";

class ChatMessageRepository extends BaseRepository {
    constructor() {
        super(ChatMessage);
    }
}

export default new ChatMessageRepository();
