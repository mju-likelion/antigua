import { Next } from 'koa';
import { RouterContext } from 'koa-router';

import Admin from '../models/admin';

import generateError from './errGenerator';

const checkAdmin = async (ctx: RouterContext, next: Next): Promise<any> => {
  const { user } = ctx.state;

  try {
    const admin = await Admin.findOne({ userId: user.id });

    if (!admin) {
      // does not have admin permission
      await generateError(ctx, 'ERR_F001');
      return;
    }

    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export default checkAdmin;
