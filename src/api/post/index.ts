import Router from 'koa-router';

import checkAdmin from '../../lib/checkAdmin';
import checkLoggedIn from '../../lib/checkLoggedIn';

import * as postCtrl from './post.ctrl';

const post = new Router();

post.post('/add-post', checkLoggedIn, checkAdmin, postCtrl.addPost);
post.patch('/update-post', checkLoggedIn, checkAdmin, postCtrl.updatePost);

post.post('/add-homework', checkLoggedIn, checkAdmin, postCtrl.addHomework);
post.patch(
  '/update-homework',
  checkLoggedIn,
  checkAdmin,
  postCtrl.updateHomework,
);

export default post;
