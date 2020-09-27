import Joi from 'joi';
import { RouterContext } from 'koa-router';

import User from '../../models/user';

// 회원가입
// POST /api/auth/register
export const register = async (ctx: RouterContext): Promise<void> => {
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
      }).required(),
    ),
    github: Joi.string(),
    infoOpen: Joi.object({
      cellPhone: Joi.boolean().required(),
      email: Joi.boolean().required(),
    }).required(),
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
    // 입력받은 것과 같은 폰 번호, 이메일, 학번, github를 가진 사람 찾기
    const cellPhoneExist = await User.findOne({ cellPhone });
    const emailExist = await User.findOne({ email });
    const sidExist = await User.findOne({ sid });
    const githubExist = await User.findOne({ github });

    // 만약 같은 폰 번호, 이메일, 학번, github를 가진 사람이 있다면
    if (cellPhoneExist || emailExist || sidExist || githubExist) {
      ctx.status = 409; // Conflict
      return;
    }

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

// 이메일 검증
// POST /api/auth/email-check/:id/:token
export const emailCheck = async (ctx: RouterContext): Promise<void> => {
  const { id, token } = ctx.params;

  const schema = Joi.string().length(6);
  const result = schema.validate(token);

  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  try {
    const user = await User.findById({ _id: id });
    // 해당 id로 계정이 존재하지 않으면
    if (!user) {
      ctx.status = 404; // Not found
      return;
    }

    // 이메일 토큰이 맞지 않으면
    if (user.emailToken !== token) {
      ctx.status = 401; // Unauthorized
      return;
    }

    user.emailToken = '';
    user.emailConfirmed = true;
    await user.save();

    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const modify = async (): Promise<void> => {
  // 계정 정보 수정
};
