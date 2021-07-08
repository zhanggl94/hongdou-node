import express, { Request, Response } from 'express';
import mySqlOperate from '../db/mysqlOperate';
import ResponseResult from '../module/ResponResult';
import { getQueryObject, getSplicedSQL } from '../utils/util';

const router = express.Router();

/**
 * 创建汽车信息
 */
router.post('/create', async (req: Request, res: Response) => {
    const result = new ResponseResult(res.locals);
    const sql = `INSERT INTO car (name,brand,isDefault,note, userId) VALUES (?,?,?,?,?)`;
    const paramList = [req.body.name, req.body.brand, req.body.isDefault, req.body.note, req.body.userId];
    try {
        if (req.body.isDefault === 1) {
            await setIsDefault(req.body.userId);
        }
        const data: any = await mySqlOperate.query(sql, paramList);
        let resCode = 200;
        if (!data.affectedRows) {
            result.isOk = false;
            result.message = 'Create car failed.';
            resCode = 400;
        }
        res.status(resCode).send(result);
    } catch (error) {
        result.isOk = false;
        result.error = error;
        result.message = 'There is some system errors.';
        res.status(400).send(result);
    }
});

/**
 * 查询汽车信息
 */
router.post('/search', async (req: Request, res: Response) => {
    const result = new ResponseResult(res.locals);
    const queryObject = getQueryObject(req.body);

    let sql = `SELECT * FROM car c WHERE 1=1 ` + getSplicedSQL(queryObject,['c']);
    try {
        const data: any = await mySqlOperate.query(sql, queryObject.valueList);
        if (data.length) {
            result.data = data;
        }
        
        res.send(result);
    } catch (error) {
        result.isOk = false;
        result.message = 'There has some system error.';
        result.error = error;
        res.status(400).send(result);
    }
});

/**
 * 更新汽车信息
 */
router.post('/edit', async (req: Request, res: Response) => {
    const result = new ResponseResult(res.locals);
    const sql = `UPDATE car SET name = ?, brand = ?, isDefault = ?, note = ? WHERE id = ? AND userId = ?`;
    const body = req.body;
    const paramList = [body.name, body.brand, body.isDefault, body.note, body.id, body.userId];
    try {
        if (body.isDefault === 1) { // 当设置为默认值时，清除其他汽车的默认选项(默认汽车只有一辆)
            await setIsDefault(body.userId);
        }
        const data: any = await mySqlOperate.query(sql, paramList);
        let responseCode = 200;
        if (!data.affectedRows) {
            result.isOk = false;
            result.message = 'Update car failed.';
            responseCode = 400;
        }
        res.status(responseCode).send(result);
    } catch (error) {
        result.isOk = false;
        result.error = error;
        result.message = 'There has some system error.';
    }
});

/**
 * 汽车只能有一辆是默认值
 * @param mysql 
 * @param userId 
 */
const setIsDefault = async (userId: string) => {
    const sql = `UPDATE car SET isDefault = 0 WHERE userId = ? AND isDefault = 1`;
    const paramList = [userId];
    await mySqlOperate.query(sql, paramList);
}

/**
 * 删除汽车信息
 */
router.post('/delete', async (req: Request, res: Response) => {
    const sql = `DELETE FROM car WHERE id=?`;
    const paramList = [req.body.id];
    const result = new ResponseResult(res.locals);
    try {
        const data: any = await mySqlOperate.query(sql, paramList);
        let resCode = 200;
        if (!data.affectedRows) {
            result.isOk = false;
            result.message = 'There is no record be deleted. Delete failed.';
            resCode = 400;
        }
        res.status(resCode).send(result);
    } catch (error) {
        result.isOk = false;
        result.error = error;
        result.message = 'There has some system erro.';
    }
})
export default router;