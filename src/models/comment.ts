import { model, Schema, Document } from 'mongoose';

const CommentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment' },
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
  parent?: Schema.Types.ObjectId;
}

const Comment = model<ICommentSchema>('Comment', CommentSchema);

export default Comment;
