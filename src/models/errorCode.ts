import mongoose, { Document, Schema } from 'mongoose';

const ErrorCodeSchema = new Schema({
  errorCode: { type: String, required: true, unique: true },
  httpStatus: { type: Number, required: true },
  message: { type: String, required: true },
});

interface IErrorCodeSchema extends Document {
  errorCode: string;
  httpStatus: number;
  message: string;
}

ErrorCodeSchema.methods.serialize = function () {
  const data = this.toJSON();
  return {
    errorCode: data.errorCode,
    message: data.message,
  };
};

export interface IErrorCode extends IErrorCodeSchema {
  serialize: () => { errorCode: string; message: string };
}

const ErrorCode = mongoose.model<IErrorCode>('ErrorCode', ErrorCodeSchema);

export default ErrorCode;
