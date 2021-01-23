import Joi from 'joi';
import { RouterContext } from 'koa-router';

import User, { IUser } from '../../models/user';

// 회원정보 조회
// GET /api/auth/user-list
export const userList = async (ctx: RouterContext): Promise<void> => {
  const numPage = 10;

  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    const users =
      (await User.find({
        accountConfirmed: true,
      })
        .limit(numPage)
        .skip((page - 1) * numPage)
        .exec()) || [];

    ctx.body = users.map((user: IUser) => {
      const userObj = user.serialize();
      return {
        _id: userObj._id,
        name: userObj.name,
        activity: userObj.activity,
        major: userObj.major,
      };
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 특정 회원정보 조회
// GET /api/auth/user-detail/:id
export const userDetail = async (ctx: RouterContext): Promise<void> => {
  const { id } = ctx.params;

  try {
    const user = await User.findById({ _id: id });
    // 해당 id로 계정이 존재하지 않으면
    if (!user) {
      ctx.status = 404; // Not found
      return;
    }

    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 회원가입
// POST /api/auth/register
export const register = async (ctx: RouterContext): Promise<void> => {
  // Request body 검증용 schema
  const schema = Joi.object().keys({
    name: Joi.string().min(2).max(4).required(),
    cellPhone: Joi.string()
      .pattern(/\b\d{11,11}\b/)
      .required(),
    personalEmail: Joi.string().email().required(),
    likelionEmail: Joi.string().pattern(/@likelion.org\b/),
    password: Joi.string().min(8).required(),
    gender: Joi.string().valid('male', 'female').required(),
    sid: Joi.string()
      .pattern(/\b\d{8,8}\b/)
      .required(),
    major: Joi.string().min(2).required(),
    activity: Joi.array()
      .items(
        Joi.object({
          generation: Joi.number().required(),
          position: Joi.string()
            .valid('member', 'manager', 'president', 'vicepresident')
            .required(),
        }).required(),
      )
      .required(),
    github: Joi.string(),
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
    personalEmail,
    likelionEmail,
    password,
    gender,
    sid,
    major,
    activity,
    github,
  } = ctx.request.body;

  try {
    // 입력받은 것과 같은 폰 번호, 이메일, 학번, github를 가진 사람 찾기
    const cellPhoneExist = await User.findOne({ cellPhone });
    const personalEmailExist = await User.findOne({ personalEmail });
    const likelionEmailExist = await User.findOne({ likelionEmail });
    const sidExist = await User.findOne({ sid });
    const githubExist = await User.findOne({ github });

    // 만약 같은 폰 번호, 이메일, 학번, github를 가진 사람이 있다면
    if (
      cellPhoneExist ||
      personalEmailExist ||
      likelionEmailExist ||
      sidExist ||
      githubExist
    ) {
      ctx.status = 409; // Conflict
      return;
    }

    const user = new User({
      name,
      cellPhone,
      personalEmail,
      likelionEmail,
      gender,
      sid,
      major,
      activity,
      github,
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

// 로그인
// POST /api/auth/login
export const login = async (ctx: RouterContext): Promise<void> => {
  // Request body 검증용 schema
  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });

  // 양식이 맞지 않으면 400 에러
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { email, password } = ctx.request.body;

  try {
    const user = await User.findOne({ personalEmail: email });
    const valid = await user?.checkPassword(password);
    // 해당 email을 가진 user가 존재하지 않거나
    // 비밀번호가 일치하지 않으면
    if (!user || !valid) {
      ctx.status = 401; // Unauthorized
      ctx.body = 'Email is not exist or password is not match.';
      return;
    }

    if (!user.emailConfirmed) {
      ctx.status = 401; // Unauthorized
      ctx.body = 'You must confirm your email first.';
      return;
    }

    ctx.body = user.serialize();

    const token = user.generateToken();
    if (!token) throw Error;

    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 로그인 상태 확인
// GET /api/auth/check
export const check = async (ctx: RouterContext): Promise<void> => {
  const { user } = ctx.state;
  // 로그인 중이 아니라면
  if (!user) {
    ctx.status = 401; // Unauthorized
    return;
  }
  ctx.body = user;
};

// 로그아웃
// POST /api/auth/logout
export const logout = async (ctx: RouterContext): Promise<void> => {
  ctx.cookies.set('access_token');
  ctx.status = 204; // No content
};

// 이메일 검증
// POST /api/auth/email-check/:id/:token
export const emailCheck = async (ctx: RouterContext): Promise<void> => {
  const { id, token } = ctx.params;

  const schema = Joi.string().length(32);
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
    await user.sendNotiToAdmin();
    await user.save();

    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 계정 정보 수정
// PATCH /api/auth/modify
export const modify = async (ctx: RouterContext): Promise<void> => {
  const { id } = ctx.state.user;

  // TODO: 비밀번호 업데이트

  // Request body 검증용 schema
  const schema = Joi.object().keys({
    name: Joi.string().min(2).max(4),
    cellPhone: Joi.string().pattern(/\b\d{11,11}\b/),
    personalEmail: Joi.string().email(),
    likelionEmail: Joi.string().pattern(/@likelion.org\b/),
    oldPassword: Joi.string().min(8),
    newPassword: Joi.string().min(8),
    gender: Joi.string().valid('male', 'female'),
    sid: Joi.string().pattern(/\b\d{8,8}\b/),
    major: Joi.string().min(2),
    activity: Joi.array().items(
      Joi.object({
        generation: Joi.number().required(),
        position: Joi.string()
          .valid('member', 'manager', 'president', 'vicepresident')
          .required(),
      }).required(),
    ),
    github: Joi.string(),
    company: Joi.string(),
  });

  // 양식이 맞지 않으면 400 에러
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // true면 업데이트 이후의 값을, false면 업데이트 이전의 값을 반환함
    });
    if (!user) {
      ctx.status = 404;
      return;
    }
    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};
