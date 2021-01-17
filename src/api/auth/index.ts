import Router from 'koa-router';

import checkLoggedIn from '../../lib/checkLoggedIn';
import checkObjectId from '../../lib/checkObjectId';

import * as authCtrl from './auth.ctrl';

const auth = new Router();

auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', checkLoggedIn, authCtrl.check);
auth.post('/logout', checkLoggedIn, authCtrl.logout);

auth.get('/email-check/:id/:token', checkObjectId, authCtrl.emailCheck);
auth.patch('/modify/:id', checkLoggedIn, checkObjectId, authCtrl.modify);

export default auth;
