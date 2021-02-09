import { Next } from 'koa';
import { RouterContext } from 'koa-router';
import mongoose from 'mongoose';

import generateError from './errGenerator';

const { ObjectId } = mongoose.Types;

const checkObjectId = async (ctx: RouterContext, next: Next): Promise<any> => {
  const { id } = ctx.params;

  try {
    if (!ObjectId.isValid(id)) {
      // ObjectId format does not match
      await generateError(ctx, 'ERR_B001');
      return;
    }
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export default checkObjectId;
