import { model, Schema, Document } from 'mongoose';

// mongoose schema
const PostSchema = new Schema(
  {
    kinds: {
      type: String,
      enum: ['announcement', 'homework'],
      required: true,
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, unique: true },
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
type Kinds = 'announcement' | 'homework';

interface IPostSchema extends Document {
  kinds: Kinds;
  author: Schema.Types.ObjectId;
  title: string;
  content: string;
}

PostSchema.methods.serialize = function () {
  const data = this.toJSON();
  const content = String(data.content);
  data.content =
    content.length > 100 ? `${content.substring(0, 100)}...` : content;
  return data;
};

export interface IPost extends IPostSchema {
  serialize: () => IPostSchema;
}

const Post = model<IPost>('Post', PostSchema);

export default Post;
