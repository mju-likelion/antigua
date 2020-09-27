import { Context } from 'koa';
import Joi from 'joi';

import User from '../../models/user';

// 회원가입
// POST /api/auth/register
export const register = async (ctx: Context): Promise<void> => {
  // Request body 검증용 schema
  const schema = Joi.object().keys({
    name: Joi.string().min(2).max(4).required(),
    cellPhone: Joi.string()
      .pattern(/\b\d{11,11}\b/)
      .required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    gender: Joi.string().valid('male', 'female').required(),
    sid: Joi.string()
      .pattern(/\b\d{8,8}\b/)
      .required(),
    major: Joi.string().min(2).required(),
    activity: Joi.array().items(
      Joi.object({
        generation: Joi.number().required(),
        position: Joi.string().valid('normal', 'manager', 'chief').required(),
      }),
    ),
    github: Joi.string(),
    infoOpen: Joi.object({
      cellPhone: Joi.boolean().required(),
      email: Joi.boolean().required(),
    }),
  });

  // 양식이 맞지 않으면 400 에러
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const {
    name,
    cellPhone,
    email,
    password,
    gender,
    sid,
    major,
    activity,
    github,
    infoOpen,
  } = ctx.request.body;

  try {
    // TODO: 같은 이메일, 학번, github를 가진 사람이 있는지 확인하고 있으면 409 리턴하기
    // TODO: 이메일 인증 토큰 생성 및 이메일 보내기

    const user = new User({
      name,
      cellPhone,
      email,
      gender,
      sid,
      major,
      activity,
      github,
      infoOpen,
      emailConfirmed: false,
      accountConfirmed: false,
    });
    await user.setPassword(password);
    user.generateEmailToken();
    await user.sendEmailToken();
    await user.save();

    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const login = async (): Promise<void> => {
  // 로그인
};

export const check = async (): Promise<void> => {
  // 로그인 상태 확인
};

export const logout = async (): Promise<void> => {
  // 로그아웃
};

export const emailCheck = async (): Promise<void> => {
  // 이메일 검증
};

export const modify = async (): Promise<void> => {
  // 계정 정보 수정
};
