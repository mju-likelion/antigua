import Router from 'koa-router';

import checkLoggedIn from '../../lib/checkLoggedIn';
import checkObjectId from '../../lib/checkObjectId';

import * as authCtrl from './auth.ctrl';

const auth = new Router();

auth.get('/user-list', checkLoggedIn, authCtrl.userList);
auth.get('/user-detail/:id', checkLoggedIn, checkObjectId, authCtrl.userDetail);
auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', checkLoggedIn, authCtrl.check);

auth.post('/email-check/:id/:token', checkObjectId, authCtrl.emailCheck);
auth.patch('/modify', checkLoggedIn, authCtrl.modify);

export default auth;
