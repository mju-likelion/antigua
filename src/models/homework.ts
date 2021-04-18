import { model, Schema, Document } from 'mongoose';

const HomeworkSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    lecture: {
      type: Schema.Types.ObjectId,
      ref: 'Lecture',
    },
    countSubmitted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

interface IHomeworkSchema extends Document {
  post: Schema.Types.ObjectId;
}

HomeworkSchema.methods.submitHomework = async function (): Promise<void> {
  this.countSubmitted += 1;
  await this.save();
};

export interface IHomework extends IHomeworkSchema {
  submitHomework: () => Promise<void>;
}

const Homework = model<IHomework>('Homework', HomeworkSchema);

export default Homework;
