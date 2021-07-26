/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-08 11:27:45
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-20 17:34:46
 */
import express, { Request } from 'express';
import mySqlOperate from '../db/mysqlOperate';
import { cryPassword } from '../utils/cryptoUtil';
import { createToken } from '../utils/jwtUtil';
import { formatDateHour24 } from '../utils/util';
import constants from '../utils/constants';
import ResponResult from '../module/ResponResult';

const router = express.Router();

router.post('/signin', async (req, res) => {
  try {
    const result = await isUserExist(req);
    if (result.code) {
      res.send(result);
    } else {
      res.status(401).send(result);
    }
  } catch (error) {
    res.status(401).send({ code: 0, error, message: 'There has some system error.' });
  }
})

const isUserExist = async (req: Request) => {
  const notRefreshToken = {
    isRefreshClientToken: false,
    refreshToken: ''
  };
  const result = new ResponResult(notRefreshToken);
  const sql = `SELECT id, password, createtime FROM user WHERE username = ?`;
  const paramList = [req.body.username];
  try {
    const data: any = await mySqlOperate.query(sql, paramList);
    if (data.length) {
      const { id, password, createtime } = data[0];
      if (password === cryPassword(req.body.password, formatDateHour24(new Date(createtime), constants.time_zone_zh_cn))) {
        result.code = 1;
        result.jwtToken = createToken({ username: req.body.username, userid: id });
        const updateSql = `UPDATE user SET lastlogintime = ? where id = ?`;
        const updateParamList = [formatDateHour24(new Date(), constants.time_zone_zh_cn), id];
        mySqlOperate.query(updateSql, updateParamList);
        result.data = { id: id, username: req.body.username }
      } else {
        result.code = 0;
        result.message = 'Username or password is not corrected.';
      }
    } else {
      result.code = 0;
      result.message = 'User not exist.';
    }
  } catch (error: any) {
    result.code = 0;
    result.error = error;
    result.message = 'There has some errors when query user.';
  }
  return result;
}

export default router;