import { model, Schema, Document } from 'mongoose';

// mongoose schema
const PostSchema = new Schema(
  {
    kinds: {
      type: String,
      enum: ['post', 'announcement', 'homework'],
      required: true,
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

// TypeScript interfaces
interface IPostSchema extends Document {
  kinds: string;
  author: string;
  title: string;
  content: string;
}

const Post = model<IPostSchema>('Post', PostSchema);

export default Post;
