import { RouterContext } from 'koa-router';

import Admin from '../../models/admin';
import User, { IUser } from '../../models/user';

// 미승인 회원 목록
// GET /api/admin/list-unapproved
export const listUnapproved = async (ctx: RouterContext): Promise<void> => {
  try {
    const unapproved = await User.find({
      accountConfirmed: false,
    }).exec();

    ctx.body = unapproved.map((user: IUser) => user.serialize());
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 회원 승인
// POST /api/admin/approve/:id
export const approve = async (ctx: RouterContext): Promise<void> => {
  const { id } = ctx.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      ctx.status = 404;
      return;
    }

    if (!user.emailConfirmed) {
      ctx.status = 401;
      return;
    }

    if (user.accountConfirmed) {
      ctx.status = 409;
      return;
    }

    await user.approve();

    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

// Admin 승격 (aka 개구멍)
// POST /api/admin/to-admin
// TODO: 운영진 등록 후 반드시 지울 것!
export const toAdmin = async (ctx: RouterContext): Promise<void> => {
  try {
    const user = await User.findById(ctx.state.user.id);

    if (!user) {
      ctx.status = 401;
      return;
    }

    const admin = new Admin({
      userId: user,
    });

    await admin.save();

    ctx.body = user.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};
