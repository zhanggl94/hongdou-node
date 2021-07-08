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
        if (result.isOk) {
            res.send(result);
        } else {
            res.status(400).send(result);
        }
    } catch (error) {
        res.status(400).send({ isOk: false, error, message: 'There has some system error.' });
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
            if (password === cryPassword(req.body.password, formatDateHour24(createtime, constants.time_zone_zh_cn))) {
                result.isOk = true;
                result.jwtToken = createToken({ username: req.body.username, userid: id });
                const updateSql = `UPDATE user SET lastlogintime = ? where id = ?`;
                const updateParamList = [formatDateHour24(new Date(), constants.time_zone_zh_cn), id];
                mySqlOperate.query(updateSql, updateParamList);
            } else {
                result.isOk = false;
                result.message = 'Username or password is not corrected.';
            }
        } else {
            result.isOk = false;
            result.message = 'User not exist.';
        }
    } catch (error) {
        result.isOk = false;
        result.error = error;
        result.message = 'There has some errors when query user.';
    }
    return result;
}

export default router;