import Router from 'koa-router';

import admin from './admin';
import auth from './auth';
import post from './post';

const api = new Router();

api.use('/auth', auth.routes());
api.use('/admin', admin.routes());
api.use('/post', post.routes());

export default api;
