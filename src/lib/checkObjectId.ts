import { Next } from 'koa';
import { RouterContext } from 'koa-router';
import mongoose from 'mongoose';

import ErrorCode from '../models/errorCode';

const { ObjectId } = mongoose.Types;

const checkObjectId = async (ctx: RouterContext, next: Next): Promise<any> => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    const errb001 = await ErrorCode.findOne({ errorCode: 'ERR_B001' });
    ctx.status = errb001?.httpStatus as number;
    ctx.body = errb001?.serialize();
    return;
  }
  return next();
};

export default checkObjectId;
