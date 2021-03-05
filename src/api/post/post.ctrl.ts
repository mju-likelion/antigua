import { RouterContext } from 'koa-router';

export const addAnnouncement = async (ctx: RouterContext): Promise<void> => {
  ctx.body = '/api/post/add-announcement';
};

export const updateAnnouncement = async (ctx: RouterContext): Promise<void> => {
  ctx.body = '/api/post/update-announcement';
};

export const addHomework = async (ctx: RouterContext): Promise<void> => {
  ctx.body = '/api/post/add-homework';
};

export const updateHomework = async (ctx: RouterContext): Promise<void> => {
  ctx.body = '/api/post/update-homework';
};
