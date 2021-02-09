import Joi from 'joi';
import { RouterContext } from 'koa-router';

import generateError from '../../lib/errGenerator';
import User, { IUser } from '../../models/user';

// 회원정보 조회
// GET /api/auth/user-list
export const userList = async (ctx: RouterContext): Promise<void> => {
  const numPage = 10;

  const page = parseInt(ctx.query.page || '1', 10);

  try {
    if (page < 1) {
      await generateError(ctx, 'ERR_B003');
      return;
    }

    const users =
      (await User.find({
        accountConfirmed: true,
      })
        .limit(numPage)
        .skip((page - 1) * numPage)
        .exec()) || [];
    const userCount = await User.countDocuments().exec();

    ctx.set('Last-Page', Math.ceil(userCount / numPage).toString());
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
      await generateError(ctx, 'ERR_N001');
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

  const result = schema.validate(ctx.request.body);

  try {
    if (result.error) {
      // input format does not match
      await generateError(ctx, 'ERR_B002');
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

    // 입력받은 것과 같은 폰 번호, 이메일, 학번, github를 가진 사람 찾기
    const cellPhoneExist = await User.findOne({ cellPhone });
    const personalEmailExist = await User.findOne({ personalEmail });
    const likelionEmailExist = await User.findOne({ likelionEmail });
    const sidExist = await User.findOne({ sid });
    const githubExist = await User.findOne({ github });

    if (
      cellPhoneExist ||
      personalEmailExist ||
      likelionEmailExist ||
      sidExist ||
      githubExist
    ) {
      // already has the same phone number, email, student ID, and github
      await generateError(ctx, 'ERR_C001');
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

  const result = schema.validate(ctx.request.body);

  try {
    if (result.error) {
      // input format does not match
      await generateError(ctx, 'ERR_B002');
      return;
    }

    const { email, password } = ctx.request.body;
    const user = await User.findOne({ personalEmail: email });
    const valid = await user?.checkPassword(password);

    if (!user) {
      // email does not exist
      await generateError(ctx, 'ERR_U003');
      return;
    }

    if (!valid) {
      // email does not match
      await generateError(ctx, 'ERR_U004');
      return;
    }

    if (!user.emailConfirmed) {
      // email does not verify
      await generateError(ctx, 'ERR_F002');
      return;
    }

    ctx.body = user.serialize();

    const token = user.generateToken();
    if (!token) throw Error;

    ctx.set('access_token', token);
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 로그인 상태 확인
// GET /api/auth/check
export const check = async (ctx: RouterContext): Promise<void> => {
  const { user } = ctx.state;

  try {
    if (!user) {
      // not logged in
      await generateError(ctx, 'ERR_U001');
      return;
    }

    ctx.body = user;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 이메일 검증
// POST /api/auth/email-check/:id/:token
export const emailCheck = async (ctx: RouterContext): Promise<void> => {
  const { id, token } = ctx.params;

  const schema = Joi.string().length(32);
  const result = schema.validate(token);

  try {
    if (result.error) {
      // input format does not match
      await generateError(ctx, 'ERR_B002');
      return;
    }

    const user = await User.findById({ _id: id });

    if (!user) {
      // id does not exist
      await generateError(ctx, 'ERR_N001');
      return;
    }

    if (user.emailToken !== token) {
      // email token does not match
      await generateError(ctx, 'ERR_U002');
      return;
    }

    user.emailToken = '';
    user.emailConfirmed = true;

    if (!user.accountConfirmed) {
      await user.sendNotiToAdmin();
    }

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

  try {
    // 양식이 맞지 않으면 400 에러
    const result = schema.validate(ctx.request.body);
    if (result.error) {
      await generateError(ctx, 'ERR_B002');
      ctx.body = {
        ...ctx.body,
        joi: result.error,
      };
      return;
    }

    const { personalEmail, oldPassword, newPassword } = result.value;

    const user = (await User.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // true면 업데이트 이후의 값을, false면 업데이트 이전의 값을 반환함
    })) as IUser;

    if (newPassword) {
      if (oldPassword) {
        if (oldPassword === newPassword) {
          // 새 비밀번호와 기존 비밀번호가 같을 때
          await generateError(ctx, 'ERR_C002');
          return;
        }

        const isPwCorrect = await user.checkPassword(oldPassword);
        if (!isPwCorrect) {
          // 기존 비밀번호 입력이 틀렸을 때
          await generateError(ctx, 'ERR_U004');
          return;
        }

        await user.setPassword(newPassword);
        await user.save();
      } else {
        // 새 비밀번호는 입력했지만 기존 비밀번호를 입력하지 않았을 때
        await generateError(ctx, 'ERR_B002');
        return;
      }
    } else if (oldPassword) {
      // 기존 비밀번호는 입력했지만 새 비밀번호를 입력하지 않았을 때
      await generateError(ctx, 'ERR_B002');
      return;
    }

    if (personalEmail) {
      user.generateEmailToken();
      user.emailConfirmed = false;
      await user.sendEmailToken();
      await user.save();
    }

    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};
