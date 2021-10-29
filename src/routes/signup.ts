import express, { Request, Response } from 'express';
import { cryPassword } from '../utils/cryptoUtil';
import { formatDateHour24 } from '../utils/util';
import { createToken } from '../utils/jwtUtil';
import constants from '../utils/constants';
import mySqlOperate from '../db/mysqlOperate';
import ResponResult from '../module/ResponResult';
const router = express.Router();

const notRefreshToken = {
  isRefreshClientToken: false,
  refreshToken: ''
};

router.post('/signup', async (req: Request, res: Response) => {
  let result: ResponResult = new ResponResult(notRefreshToken);
  try {
    result = await isUserExist(req); // 判断用户是否重复
    if (!result.code) {
      res.status(422).send(result);
    } else {
      if (result.code) {
        result = await createUser(req) // 创建用户
        if (result.code) {
          result.status = 200;
          result.jwtToken = createToken({ username: req.body.username, userId: result.data.userId });
        }
        res.status(result.status).send(result);
      }
    }
  } catch (error) {
    res.status(400).send({ code: false, error, message: 'There has some system error.' });
  }
});

/**
 * 检查用户是否已经存在
 * @param req 
 * @param res 
 * @param mysql 
 */
const isUserExist = async (req: Request) => {
  const result = new ResponResult(notRefreshToken);
  const sql = `select id from user where username = ?`;
  const paramList: Array<string> = [req.body.username];
  try {
    const data: any = await mySqlOperate.query(sql, paramList)
    if (data.length) {
      result.code = 0;
      result.message = 'The user has regisited.';
    }
  } catch (error: any) {
    console.log(`Query user error.${error}`);
    result.code = 0;
    result.error = error;
    result.message = 'Query user error.';
  }
  return result;
}

/**
 * 创建用户
 * @param req 请求
 * @param res 响应
 * @param mysql 数据库操作对象
 */
const createUser = async (req: Request,) => {
  const result = new ResponResult(notRefreshToken);
  const currentDateTime = formatDateHour24(new Date(), constants.time_zone_zh_cn);
  const sql = `INSERT INTO user (id,username,password,createtime,lastlogintime) VALUES (null,?,?,?,?)`;
  const cryPwd = cryPassword(req.body.password, currentDateTime);
  const paramList = [req.body.username, cryPwd, currentDateTime, currentDateTime];
  try {
    const data: any = await mySqlOperate.query(sql, paramList)
    if (!data.affectedRows) {
      result.code = 0;
      result.message = 'Create user in db failed.';
    } else {
      result.data = { id: data.insertId, username: req.body.username };
    }
  } catch (error: any) {
    result.code = 0;
    result.error = error;
    result.message = 'Create user in db failed.';
  }
  return result;
}
export default router;