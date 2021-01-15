import Router from 'koa-router';

import * as adminCtrl from './admin.ctrl';

const admin = new Router();

admin.get('/wating-account-list', adminCtrl.waitingAccountList);

export default admin;
