import { Next } from 'koa';
import { RouterContext } from 'koa-router';

import ErrorCode from '../models/errorCode';

const checkLoggedIn = async (ctx: RouterContext, next: Next): Promise<any> => {
  const { user } = ctx.state;

  if (!user) {
    const erru001 = await ErrorCode.findOne({ errorCode: 'ERR_U001' });
    ctx.status = erru001?.httpStatus as number;
    ctx.body = erru001?.serialize();
    return;
  }

  return next();
};

export default checkLoggedIn;
