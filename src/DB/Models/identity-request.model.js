import mongoose from "mongoose";
import { REQUEST_STATUS } from "../../Utils/constants.js";

const identityRequestSchema = new mongoose.Schema(
  {
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true, unique: true },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
  },
  { timestamps: true }
);

const IdentityRequest = mongoose.model("IdentityRequest", identityRequestSchema);

export default IdentityRequest;
