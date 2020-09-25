import mongoose, { Schema } from 'mongoose';

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
  passwd: String, // 암호화된 비밀번호
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

const User = mongoose.model('User', UserSchema);

export default User;
