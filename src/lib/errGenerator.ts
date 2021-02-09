import { RouterContext } from 'koa-router';

import ErrorCode from '../models/errorCode';

const generateError = async (
  ctx: RouterContext,
  errorCode: string,
): Promise<void> => {
  try {
    const errCode = await ErrorCode.findOne({ errorCode });

    if (!errCode) {
      return;
    }

    ctx.status = errCode.httpStatus;
    ctx.body = errCode.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export default generateError;
