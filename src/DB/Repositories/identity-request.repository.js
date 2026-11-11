import IdentityRequest from "../Models/identity-request.model.js";
import BaseRepository from "./base.repository.js";

class IdentityRequestRepository extends BaseRepository {
    constructor() {
        super(IdentityRequest);
    }
}

export default new IdentityRequestRepository();
