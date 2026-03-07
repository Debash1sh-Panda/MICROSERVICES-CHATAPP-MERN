import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "chats",
      required: true,
    },

    sender: {
      type: String,
      required: true,
    },

    text: String,
    image: {
      url: String,
      publicId: String,
    },
    messageType: {
      enum: ["text", "image"],
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Boolean, default: null },
  },
  { timestamps: true },
);

export const Messages = mongoose.model<IMessage>("messages", messageSchema);
