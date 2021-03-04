import { RouterContext } from 'koa-router';

export const addPost = async (ctx: RouterContext): Promise<void> => {
  ctx.body = '/api/post/add-post';
};

export const updatePost = async (ctx: RouterContext): Promise<void> => {
  ctx.body = '/api/post/update-post';
};

export const addHomework = async (ctx: RouterContext): Promise<void> => {
  ctx.body = '/api/post/add-homework';
};

export const updateHomework = async (ctx: RouterContext): Promise<void> => {
  ctx.body = '/api/post/update-homework';
};
