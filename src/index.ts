/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-08 11:27:45
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-28 10:55:04
 */
import express from 'express';
import bodyParser from 'body-parser';
import auth from './routes/auth';
import signupRouter from './routes/signup';
import signinRouter from './routes/signin';
import userRouter from './routes/user';
import carRouter from './routes/car';
import billRouter from './routes/bill/bill';
import billTypeRouter from './routes/bill/billtype';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(auth);
app.use('/api', signupRouter);
app.use('/api', signinRouter);
app.use('/api/user', userRouter);
app.use('/api/car', carRouter);
app.use('/api/bill', billRouter);
app.use('/api/billtype', billTypeRouter);

app.listen(3001, () => {
    console.log('node server start at 3001.');
});