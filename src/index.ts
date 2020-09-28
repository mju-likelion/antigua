import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import api from './api';
import jwtMiddleware from './lib/jwtMiddleware';

// process.env.*을 통해 .env파일에 접근을 허용
dotenv.config();

// destructuring을 통해 process.env 내부 값에 대한 reference 만들기
const { PORT, MONGO_URI } = process.env;

// DB 연결
async function connectDB() {
  try {
    await mongoose.connect(
      MONGO_URI || 'mongodb://localhost:27017/mjuLikelionDB',
      {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    console.log('Connected to MongoDB');
  } catch (e) {
    console.error(e);
  }
}
connectDB();

const app = new Koa();
const router = new Router();

// 모든 router를 /api로 받기
router.use('/api', api.routes());

// request의 body를 받기 위해서 bodyparser 추가
app.use(bodyParser());

// jwt Token이 있는 경우 로그인 상태를 확인하기 위해
app.use(jwtMiddleware);

app.use(router.routes()).use(router.allowedMethods());

const port = PORT || 4000;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
