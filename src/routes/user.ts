/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-14 11:15:59
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-14 11:19:35
 */
import express, { Request, Response } from 'express';
import ResponResult from '../module/ResponResult';
import constants from '../utils/constants';
import { cryPassword } from '../utils/cryptoUtil';
import { formatDateHour24 } from '../utils/util';

const router = express.Router();

router.post('/edit', (req: Request, res: Response) => {
  const result: ResponResult = new ResponResult(res.locals);
  try {
    const { id, username, password } = req.body;
    const currentDateTime = formatDateHour24(new Date(), constants.time_zone_zh_cn);
    const cryPwd = cryPassword(password, currentDateTime);
    const sql = `select id from user where id=? AND username=? AND password=?`;
  } catch (error) {

  }
})

export default router;