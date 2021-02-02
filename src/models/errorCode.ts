import mongoose, { Document, Schema } from 'mongoose';

const ErrorCodeSchema = new Schema({
  errorCode: { type: String, required: true },
  httpStatus: { type: Number, required: true },
  message: { type: String, required: true },
});

interface IErrorCodeSchema extends Document {
  errorCode: string;
  httpStatus: number;
  message: string;
}

const ErrorCode = mongoose.model<IErrorCodeSchema>(
  'ErrorCode',
  ErrorCodeSchema,
);

export default ErrorCode;
