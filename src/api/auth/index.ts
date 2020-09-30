import Router from 'koa-router';

import checkObjectId from '../../lib/checkObjectId';
import * as authCtrl from './auth.ctrl';

const auth = new Router();

auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', authCtrl.check);
auth.post('/logout', authCtrl.logout);

auth.post('/email-check/:id/:token', checkObjectId, authCtrl.emailCheck);
auth.patch('/modify/:id', checkObjectId, authCtrl.modify);

export default auth;
