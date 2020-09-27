import bcrypt from 'bcrypt';
import mongoose, { Document, Schema } from 'mongoose';

// mongoose does not suppoort TypeScript officially. Reference below.
// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1

const ActivitySchema = new Schema({
  generation: Number,
  position: {
    type: String,
    enum: ['normal', 'manager', 'chief'],
  },
});

const InfoOpenSchema = new Schema({
  cellPhone: Boolean,
  email: Boolean,
});

const UserSchema = new Schema({
  name: String,
  cellPhone: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String, // 암호화된 비밀번호
  gender: { type: String, enum: ['male', 'female'] },
  sid: { type: String, unique: true },
  major: String,
  activity: [ActivitySchema],
  github: { type: String, unique: true },
  infoOpen: InfoOpenSchema,
  emailToken: String, // 이메일 인증용 토큰
  emailConfirmed: Boolean, // 이메일 인증 여부
  accountConfirmed: Boolean, // 계정의 인증 여부
});

enum Position {
  normal = 'normal',
  manager = 'manager',
  chief = 'chief',
}

interface IActivitySchema extends Document {
  generation: number;
  position: Position;
}

interface IInfoOpenSchema extends Document {
  cellPhone: boolean;
  email: boolean;
}

enum Gender {
  male = 'male',
  female = 'female',
}

interface IUserSchema extends Document {
  name: string;
  cellPhone: string;
  email: string;
  password: string;
  gender: Gender;
  sid: string;
  major: string;
  activity: IActivitySchema;
  github: string;
  infoOpen: IInfoOpenSchema;
  emailToken: string;
  emailConfirmed: boolean;
  accountConfirmed: boolean;
}

UserSchema.methods.setPassword = async function (password: string) {
  const hash = await bcrypt.hash(password, 10);
  this.password = hash;
};

UserSchema.methods.checkPassword = async function (password: string) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.password;
  return data;
};

export interface IUser extends IUserSchema {
  setPassword: (password: string) => Promise<void>;
  checkPassword: (password: string) => Promise<boolean>;
  serialize: () => Omit<IUserSchema, 'password'>;
}

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
