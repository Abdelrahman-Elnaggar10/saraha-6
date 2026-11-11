import Conversation from "../Models/conversation.model.js";
import BaseRepository from "./base.repository.js";

class ConversationRepository extends BaseRepository {
    constructor() {
        super(Conversation);
    }
}

export default new ConversationRepository();
