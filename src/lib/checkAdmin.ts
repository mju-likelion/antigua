import { Next } from 'koa';
import { RouterContext } from 'koa-router';

import Admin from '../models/admin';
import ErrorCode from '../models/errorCode';

const checkAdmin = async (ctx: RouterContext, next: Next): Promise<any> => {
  try {
    const { user } = ctx.state;

    const admin = await Admin.findOne({ userId: user.id });

    if (!admin) {
      const errf001 = await ErrorCode.findOne({ errorCode: 'ERR_F001' });
      ctx.status = errf001?.httpStatus as number;
      ctx.body = errf001?.serialize();
      return;
    }

    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export default checkAdmin;
