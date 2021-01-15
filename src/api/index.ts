import Router from 'koa-router';

import admin from './admin';
import auth from './auth';

const api = new Router();

api.use('/auth', auth.routes());
api.use('/admin', admin.routes());

export default api;
