import { model, Schema, Document } from 'mongoose';

const VideoSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

const LectureSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    videos: {
      type: [VideoSchema],
      required: true,
    },
    theme: {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
      required: true,
    },
    topic: {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export interface ILectureSchema extends Document {
  title: string;
}

const Lecture = model<ILectureSchema>('Lecture', LectureSchema);

export default Lecture;
