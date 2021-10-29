import express, { RequestHandler } from 'express';
import cors from 'cors';
import auth from './routes/auth';
import signupRouter from './routes/signup';
import signinRouter from './routes/signin';
import userRouter from './routes/user';
import carRouter from './routes/bill/car/car';
import billRouter from './routes/bill/bill';
import billTypeRouter from './routes/bill/billtype';
import payTypeRouter from './routes/bill/paytype';
import carBrandRouter from './routes/bill/car/carbrand';

const app = express();
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'],
}))

app.use(express.urlencoded({ extended: true }) as RequestHandler);
app.use(express.json() as RequestHandler);

app.use(auth);
app.use('/api', signupRouter);
app.use('/api', signinRouter);
app.use('/api/user', userRouter);
app.use('/api/car', carRouter);
app.use('/api/bill', billRouter);
app.use('/api/billtype', billTypeRouter);
app.use('/api/paytype', payTypeRouter);
app.use('/api/carbrand', carBrandRouter);

app.listen(3001, () => {
    console.log('node server start at 3001.');
});