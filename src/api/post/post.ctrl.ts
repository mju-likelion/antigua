import Joi from 'joi';
import { RouterContext } from 'koa-router';

import generateError from '../../lib/errGenerator';
import Post from '../../models/post';

export const addAnnouncement = async (ctx: RouterContext): Promise<void> => {
  const schema = Joi.object().keys({
    title: Joi.string().min(6).required(),
    content: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);

  try {
    if (result.error) {
      await generateError(ctx, 'ERR_B002');
      ctx.body = {
        ...ctx.body,
        joi: result.error,
      };
      return;
    }

    const { title, content } = ctx.request.body;

    const titleExists = await Post.findOne({ title, kinds: 'announcement' });
    if (titleExists) {
      await generateError(ctx, 'ERR_C004');
      return;
    }

    const post = new Post({
      kinds: 'announcement',
      author: ctx.state.user.id,
      title,
      content,
    });
    await post.save();

    ctx.body = post.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const updateAnnouncement = async (ctx: RouterContext): Promise<void> => {
  const { id } = ctx.params;

  const schema = Joi.object().keys({
    title: Joi.string().min(6).optional(),
    content: Joi.string().optional(),
  });

  const result = schema.validate(ctx.request.body);

  try {
    if (result.error) {
      await generateError(ctx, 'ERR_B002');
      ctx.body = {
        ...ctx.body,
        joi: result.error,
      };
      return;
    }

    const { title } = ctx.request.body;

    if (title) {
      const titleExists = await Post.findOne({ title, kinds: 'announcement' });
      if (titleExists) {
        await generateError(ctx, 'ERR_C004');
        return;
      }
    }

    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    });

    ctx.body = post?.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const addHomework = async (ctx: RouterContext): Promise<void> => {
  const schema = Joi.object().keys({
    title: Joi.string().min(6).required(),
    content: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);

  try {
    if (result.error) {
      await generateError(ctx, 'ERR_B002');
      ctx.body = {
        ...ctx.body,
        joi: result.error,
      };
      return;
    }

    const { title, content } = ctx.request.body;

    const titleExists = await Post.findOne({ title, kinds: 'homework' });
    if (titleExists) {
      await generateError(ctx, 'ERR_C004');
      return;
    }

    const post = new Post({
      kinds: 'homework',
      author: ctx.state.user.id,
      title,
      content,
    });
    await post.save();

    ctx.body = post.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const updateHomework = async (ctx: RouterContext): Promise<void> => {
  const { id } = ctx.params;

  const schema = Joi.object().keys({
    title: Joi.string().min(6).optional(),
    content: Joi.string().optional(),
  });

  const result = schema.validate(ctx.request.body);

  try {
    if (result.error) {
      await generateError(ctx, 'ERR_B002');
      ctx.body = {
        ...ctx.body,
        joi: result.error,
      };
      return;
    }

    const { title } = ctx.request.body;

    if (title) {
      const titleExists = await Post.findOne({ title, kinds: 'homework' });
      if (titleExists) {
        await generateError(ctx, 'ERR_C004');
        return;
      }
    }

    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    });

    ctx.body = post?.serialize();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const remove = async (ctx: RouterContext): Promise<void> => {
  const { id } = ctx.params;

  try {
    await Post.findByIdAndDelete(id);

    ctx.body = {
      desc: '게시글이 성공적으로 삭제되었습니다.',
    };
  } catch (e) {
    ctx.throw(500, e);
  }
};
