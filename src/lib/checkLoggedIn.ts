import { Next } from 'koa';
import { RouterContext } from 'koa-router';

const checkLoggedIn = (ctx: RouterContext, next: Next): void | Promise<any> => {
  const { user } = ctx.state;

  if (!user) {
    ctx.status = 401;
    return;
  }

  return next();
};

export default checkLoggedIn;
