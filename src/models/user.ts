import bcrypt from 'bcrypt';
import cryptoRandomString from 'crypto-random-string';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
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

UserSchema.methods.generateEmailToken = async function () {
  const token = cryptoRandomString({ length: 6 });
  this.emailToken = token;
};

UserSchema.methods.generateToken = function () {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not exist.');
    return;
  }

  const token = jwt.sign(
    {
      _id: this.id,
      name: this.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d', // expires in 7 days
    },
  );
  return token;
};

UserSchema.methods.sendEmailToken = async function () {
  const msg = {
    to: this.email,
    from: 'mail-confirm@mju-likeion.com',
    subject: '멋쟁이 사자처럼 명지대(자연) 이메일 인증',
    html: this.emailToken,
  };
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  try {
    await sgMail.send(msg);
  } catch (e) {
    console.error(e);

    if (e.response) {
      console.error(e.response.body);
    }
  }
};

UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.password;
  return data;
};

export interface IUser extends IUserSchema {
  setPassword: (password: string) => Promise<void>;
  checkPassword: (password: string) => Promise<boolean>;
  generateEmailToken: () => void;
  generateToken: () => string | void;
  sendEmailToken: () => Promise<void>;
  serialize: () => Omit<IUserSchema, 'password'>;
}

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
