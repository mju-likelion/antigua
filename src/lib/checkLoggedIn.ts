import { Next } from 'koa';
import { RouterContext } from 'koa-router';

import generateError from './errGenerator';

const checkLoggedIn = async (ctx: RouterContext, next: Next): Promise<any> => {
  const { user } = ctx.state;

  try {
    if (!user) {
      // not logged in
      await generateError(ctx, 'ERR_U001');
      return;
    }
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export default checkLoggedIn;
