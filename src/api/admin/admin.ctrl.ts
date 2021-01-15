import { RouterContext } from 'koa-router';

import User from '../../models/user';

// TODO: user approval 관리자 승인 만들기

// GET /api/admin/wating-account-list
// eslint-disable-next-line
export const waitingAccountList = async (ctx: RouterContext): Promise<void> => {
  try {
    const waitingList = await User.find({ accountConfirmed: false });
    console.log(waitingList);
  } catch (e) {
    ctx.throw(500, e);
  }
};
