import Router from 'koa-router';

import checkAdmin from '../../lib/checkAdmin';
import checkLoggedIn from '../../lib/checkLoggedIn';
import checkObjectId from '../../lib/checkObjectId';

import * as adminCtrl from './admin.ctrl';

const admin = new Router();

admin.get(
  '/list-unapproved',
  checkLoggedIn,
  checkAdmin,
  adminCtrl.listUnapproved,
);
admin.post(
  '/approve/:id',
  checkLoggedIn,
  checkAdmin,
  checkObjectId,
  adminCtrl.approve,
);

// Admin 승격 API (aka 개구멍)
// TODO: 운영진 등록 후 반드시 지울 것!
admin.post('/to-admin', checkLoggedIn, adminCtrl.toAdmin);

// ErrorCode Initialization (개구멍 하나 더 팜)
// TODO: release 브랜치로 배포 시에는 반드시 지울 것!
admin.post('/init-error-code', checkLoggedIn, adminCtrl.initErrorCode);

export default admin;
