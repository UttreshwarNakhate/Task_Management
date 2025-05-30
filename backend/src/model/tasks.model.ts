import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  status: "Todo" | "InProgress" | "Completed";
  userId: mongoose.Types.ObjectId;
  createdBy?: string;
  updatedBy?: string;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["Todo", "InProgress", "Completed"],
      default: "Todo",
    },
    // Reference to the User model
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>("Task", taskSchema);
