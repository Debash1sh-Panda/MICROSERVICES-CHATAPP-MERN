import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.config.js";

const uploadToCloudinary = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chat-uploads" },
      (
        error: any | undefined,
        result: any | undefined,
      ) => {
        if (error) reject(error);
        else resolve(result as any);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export default uploadToCloudinary;
