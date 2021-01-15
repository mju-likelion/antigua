import sgMail from '@sendgrid/mail';
import { WebClient } from '@slack/web-api';
import bcrypt from 'bcrypt';
import cryptoRandomString from 'crypto-random-string';
import jwt from 'jsonwebtoken';
import mongoose, { Document, Schema } from 'mongoose';

// mongoose does not suppoort TypeScript officially. Reference below.
// https://medium.com/@agentwhs/complete-guide-for-typescript-for-mongoose-for-node-js-8cc0a7e470c1

// mongoose schema
const ActivitySchema = new Schema({
  generation: { type: Number, required: true },
  position: {
    type: String,
    enum: ['member', 'manager', 'president', 'vicepresident'],
    required: true,
  },
});

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    cellPhone: { type: String, unique: true, required: true },
    personalEmail: { type: String, unique: true, required: true },
    likelionEmail: { type: String, unique: true },
    password: { type: String, required: true }, // 암호화된 비밀번호
    gender: { type: String, enum: ['male', 'female'], required: true },
    sid: { type: String, unique: true, required: true },
    major: { type: String, required: true },
    activity: { type: [ActivitySchema], required: true },
    github: { type: String, unique: true },
    emailToken: String, // 이메일 인증용 토큰
    emailConfirmed: { type: Boolean, required: true, default: false }, // 이메일 인증 여부
    accountConfirmed: { type: Boolean, required: true, default: false }, // 계정의 인증 여부
    company: { type: String }, // 소속 회사
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

// TypeScript interfaces
type Position = 'member' | 'manager' | 'president' | 'vicepresident';

interface IActivitySchema extends Document {
  generation: number;
  position: Position;
}

type Gender = 'male' | 'female';

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
  emailToken: string;
  emailConfirmed: boolean;
  accountConfirmed: boolean;
  company?: string;
}

// Add methods
UserSchema.methods.setPassword = async function (password: string) {
  const hash = await bcrypt.hash(password, 10);
  this.password = hash;
};

UserSchema.methods.checkPassword = async function (password: string) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

UserSchema.methods.generateEmailToken = async function () {
  const token = cryptoRandomString({ length: 32 });
  this.emailToken = token;
};

UserSchema.methods.generateToken = function (): boolean | string {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not exist.');
    return false;
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
  /* eslint-disable no-underscore-dangle */
  const msg = {
    to: this.personalEmail,
    from: `${process.env.MAILER_EMAIL}`,
    subject: '멋쟁이 사자처럼 at 명지대(자연) 이메일 인증',
    html: ` 
    <h1>안녕하세요, ${this.name}님!</h1>
    <hr />
    <br />
    <p>멋쟁이 사자처럼 at 명지대(자연) 회원가입을 환영합니다!</p>
    <p>버튼을 눌러 이메일 인증을 완료하여 주세요 :) </p>
    <br />
    <div style="text-align: center">
      <a href="${process.env.APP_DOMAIN}/api/auth/email-check/${this._id}/${this.emailToken}">
        <input type="button" value="Confirm" style="border:none; padding:1.5em; font-weight:bold; color:#ffffff; background-color:#F39925">
      </a>
    </div>
    <br />
    <hr />
    <br />
    <p> - 본 메일은 멋쟁이사자처럼 명지대(자연) 회원가입 이메일 인증을 위해 발송되었습니다.</p>
    `,
  };
  /* eslint-enable no-underscore-dangle */
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  try {
    await sgMail.send(msg);
    console.log('send mail success!');
  } catch (e) {
    console.error(e);

    if (e.response) {
      console.error(e.response.body);
    }
  }
};

UserSchema.methods.sendNotiToAdmin = async function () {
  // Slack api Token
  const token = process.env.SLACK_TOKEN;
  const web = new WebClient(token);
  // Slack Channel ID
  const conversationId = `${process.env.SLACK_CHANNEL_ID}`;

  // Mail to President
  const msg = {
    to: `${process.env.ADMIN_EMAIL}`,
    from: `${process.env.MAILER_EMAIL}`,
    subject: '멋쟁이 사자처럼 명지대(자연) 회원가입 요청',
    html: `전공: ${this.major}, 학번: ${this.sid}, 이름: ${this.name}님이 이메일 인증을 완료하였습니다. 관리자페이지에서 회원가입을 승인 해주세요.`,
  };
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

  try {
    // send mail to admin
    await sgMail.send(msg);
    // send slack message to channel
    await web.chat.postMessage({
      channel: conversationId,
      text: `전공: ${this.major}, 학번: ${this.sid}, 이름: ${this.name}님이 이메일 인증을 완료하였습니다.`,
    });
    console.log(`send mail, success!`);
  } catch (e) {
    console.error(e);

    if (e.response) {
      console.error(e.response.body);
    }
  }
};

UserSchema.methods.approve = async function () {
  const { MAILER_EMAIL, SENDGRID_API_KEY } = process.env;

  sgMail.setApiKey(SENDGRID_API_KEY || '');

  const msg = {
    to: this.personalEmail,
    from: MAILER_EMAIL as string,
    subject: '멋쟁이 사자처럼 명지대(자연) 회원 승인 완료',
    html: `
      <p>안녕하세요 <strong>${this.name}</strong>님,</p>
      <br />
      <p><strong>${this.name}</strong>님의 계정이 정상적으로 승인되었습니다.</p>
      <p>자세한 안내와 공지는 홈페이지 공지사항을 참고해주십시오.</p>
      <br />
      <p>감사합니다.</p>
      <br />
      <p>멋쟁이 사자처럼 명지대(자연) 운영진 올림.</p>
    `,
  };

  this.accountConfirmed = true;

  try {
    await this.save();

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
  sendNotiToAdmin: () => Promise<void>;
  approve: () => Promise<void>;
  serialize: () => Omit<IUserSchema, 'password'>;
}

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
