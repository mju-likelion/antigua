import Router from 'koa-router';

import checkAdmin from '../../lib/checkAdmin';
import checkLoggedIn from '../../lib/checkLoggedIn';

import * as postCtrl from './post.ctrl';

const post = new Router();

post.post(
  '/add-announcement',
  checkLoggedIn,
  checkAdmin,
  postCtrl.addAnnouncement,
);
post.patch(
  '/update-announcement',
  checkLoggedIn,
  checkAdmin,
  postCtrl.updateAnnouncement,
);

post.post('/add-homework', checkLoggedIn, checkAdmin, postCtrl.addHomework);
post.patch(
  '/update-homework',
  checkLoggedIn,
  checkAdmin,
  postCtrl.updateHomework,
);

export default post;
