import Router from 'koa-router';

import checkAdmin from '../../lib/checkAdmin';
import checkLoggedIn from '../../lib/checkLoggedIn';
import checkObjectId from '../../lib/checkObjectId';

import * as postCtrl from './post.ctrl';

const post = new Router();

post.post(
  '/add-announcement',
  checkLoggedIn,
  checkAdmin,
  postCtrl.addAnnouncement,
);
post.patch(
  '/update-announcement/:id',
  checkLoggedIn,
  checkAdmin,
  checkObjectId,
  postCtrl.updateAnnouncement,
);

post.post('/add-homework', checkLoggedIn, checkAdmin, postCtrl.addHomework);
post.patch(
  '/update-homework/:id',
  checkLoggedIn,
  checkAdmin,
  checkObjectId,
  postCtrl.updateHomework,
);

post.delete('/remove/:id', checkLoggedIn, checkAdmin, postCtrl.remove);

export default post;
