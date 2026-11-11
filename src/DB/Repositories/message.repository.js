import Message from "../Models/message.model.js";
import BaseRepository from "./base.repository.js";

class MessageRepository extends BaseRepository {
    constructor() {
        super(Message);
    }
}

export default new MessageRepository();
