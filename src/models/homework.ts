import { model, Schema, Document } from 'mongoose';

// mongoose schema
const HomeworkSchema = new Schema(
  {
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
interface IHomeworkSchema extends Document {
  author: string;
  title: string;
  content: string;
}

const Homework = model<IHomeworkSchema>('Homework', HomeworkSchema);

export default Homework;
