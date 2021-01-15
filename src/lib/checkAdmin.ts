import { Next } from 'koa';
import { RouterContext } from 'koa-router';

import Admin from '../models/admin';

const checkAdmin = async (ctx: RouterContext, next: Next): Promise<any> => {
  try {
    const { user } = ctx.state;

    const admin = await Admin.findOne({ userId: user.id });

    if (!admin) {
      ctx.status = 401;
      return;
    }

    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export default checkAdmin;
