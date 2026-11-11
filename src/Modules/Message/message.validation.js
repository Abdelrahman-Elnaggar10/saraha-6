import { z } from "zod";

export const sendMessageSchema = z.object({ body: z.strictObject({
    receiverEmail: z.email(),
    content: z.string().trim().min(1, "Message can not be empty").max(1000)
}) });

export const respondToRequestSchema = z.object({ body: z.strictObject({
    status: z.enum(["accepted", "rejected"])
}) });

export const chatMessageSchema = z.object({ body: z.strictObject({
    content: z.string().trim().min(1, "Message can not be empty").max(1000)
}) });
