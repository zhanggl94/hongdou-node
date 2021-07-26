/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-14 11:15:59
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-26 15:55:29
 */
import express, { Request, Response } from 'express';
import mySqlOperate from '../db/mysqlOperate';
import ResponResult from '../module/ResponResult';
import constants from '../utils/constants';
import { cryPassword } from '../utils/cryptoUtil';
import { formatDateHour24 } from '../utils/util';

const router = express.Router();

// 更新用户信息
router.put('/edit', async (req: Request, res: Response) => {
  let result: ResponResult = new ResponResult(res.locals);
  try {
    const { id, username, oldPassword, newPassword } = req.body;
    const sql = `select username, password, createtime from user where id=? limit 1`;
    const paramList: Array<string> = [id];
    const data: any = await mySqlOperate.query(sql, paramList)
    if (data.length) {
      const dbUsername = data[0].username;
      const dbPassword = data[0].password;
      const dbCreatetime = data[0].createtime;
      const cryPwd = cryPassword(oldPassword, formatDateHour24(new Date(dbCreatetime), constants.time_zone_zh_cn));
      if (cryPwd === dbPassword) {
        const newCryPwd = cryPassword(newPassword, formatDateHour24(new Date(dbCreatetime), constants.time_zone_zh_cn));
        const editParamList = [newCryPwd, id];
        result = await editUser(res, editParamList)
      } else {
        result.code = 0;
        result.message = '原密码不正确';
      }
    }
  } catch (error) {
    result.status = 400;
    result.code = 0;
    result.error = error;
    result.message = "Query user error.";
  } finally {
    res.status(result.status).send(result)
  }
})

// 更新用户信息
const editUser = async (res: Response, paramList: Array<string>) => {
  const result: ResponResult = new ResponResult(res.locals);
  const updateSql = `UPDATE user SET password = ? WHERE id = ?`
  try {
    const updateData = await mySqlOperate.query(updateSql, paramList)
    if (!updateData.affectedRows) {
      result.code = 0;
      result.message = 'Update user failed.';
    }
  } catch (error) {
    result.status = 400;
    result.error = error
    result.message = 'Update user error.'
  }
  return result;
}

export default router;