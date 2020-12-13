import { model, Schema, Document } from 'mongoose';

const CommentSchema = new Schema(
  {
    author: { type: String, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Homework', required: true },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

// TypeScript interfaces
interface ICommentSchema extends Document {
  author: string;
  post: string;
}
const Comment = model<ICommentSchema>('Comment', CommentSchema);

export default Comment;
