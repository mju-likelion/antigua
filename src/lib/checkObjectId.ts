import { Next } from 'koa';
import { RouterContext } from 'koa-router';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const checkObjectId = (ctx: RouterContext, next: Next): void | Promise<any> => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad request
    return;
  }
  return next();
};

export default checkObjectId;
