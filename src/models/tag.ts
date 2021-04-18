import { model, Schema, Document } from 'mongoose';

const TagSchema = new Schema({
  tagName: {
    type: String,
    required: true,
  },
});

export interface ITagSchema extends Document {
  tagName: string;
}

const Tag = model<ITagSchema>('Tag', TagSchema);

export default Tag;
