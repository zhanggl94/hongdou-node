import express, { Request, Response } from 'express';
import { parse } from 'ts-node';
import mySqlOperate from '../../../db/mysqlOperate';
import ResponseResult from '../../../module/ResponResult';
import { getQueryObject, getSplicedSQL } from '../../../utils/util';

const router = express.Router();

/**
 * 创建汽车信息
 */
router.post('/create', async (req: Request, res: Response) => {
    const result = new ResponseResult(res.locals);
    const sql = `INSERT INTO car (name,brandId,isDefault,note, userId) VALUES (?,?,?,?,?)`;
    const paramList = [req.body.name, req.body.brandId, req.body.isDefault, req.body.note, req.body.userId];
    try {
        if (req.body.isDefault === 1) {
            await setIsDefault(req.body.userId);
        }
        const data: any = await mySqlOperate.query(sql, paramList);
        if (!data.affectedRows) {
            result.code = 0;
            result.message = 'Create car failed.';
            result.status = 400;
        }
        res.status(result.status).send(result);
    } catch (error) {
        result.code = 0;
        result.error = error;
        result.message = 'There is some system errors.';
        res.status(400).send(result);
    }
});

/**
 * 查询汽车信息
 */
router.get('/select', async (req: Request, res: Response) => {
    let result = new ResponseResult(res.locals);
    try {
        const { id, userId, pageIndex, pageSize } = req.query;
        if (id && userId) {

        } else if (pageIndex && pageSize && userId) {
            result = await getCarList(res, [parseInt(userId.toString()), (parseInt(pageSize.toString()) - 1) * parseInt(pageSize.toString()), parseInt(pageSize.toString())])
        } else {
            result.code = 0;
            result.status = 405;
            result.message = 'The parameter is incorrect.';
        }
        res.status(result.status).send(result);
    } catch (error) {
        result.code = 0;
        result.message = 'There has some system error.';
        result.error = error;
        result.status = 400
        res.status(400).send(result);
    }
});

/**
 * 更新汽车信息
 */
router.put('/edit', async (req: Request, res: Response) => {
    const result = new ResponseResult(res.locals);
    const sql = `UPDATE car SET name = ?, brandId = ?, isDefault = ?, note = ? WHERE id = ? AND userId = ?`;
    const body = req.body;
    const paramList = [body.name, body.brandId, body.isDefault, body.note, body.id, body.userId];
    try {
        if (body.isDefault === 1) { // 当设置为默认值时，清除其他汽车的默认选项(默认汽车只有一辆)
            await setIsDefault(body.userId);
        }
        const data: any = await mySqlOperate.query(sql, paramList);
        let responseCode = 200;
        if (!data.affectedRows) {
            result.code = 0;
            result.message = 'Update car failed.';
            responseCode = 400;
        }
        res.status(responseCode).send(result);
    } catch (error) {
        result.code = 0;
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
router.delete('/delete', async (req: Request, res: Response) => {
    const sql = `DELETE FROM car WHERE id=?`;
    const paramList = [req.body.id];
    const result = new ResponseResult(res.locals);
    try {
        const data: any = await mySqlOperate.query(sql, paramList);
        if (!data.affectedRows) {
            result.code = 0;
            result.message = 'There is no record be deleted. Delete failed.';
            result.status = 400;
        }
        res.status(result.status).send(result);
    } catch (error) {
        result.code = 0;
        result.error = error;
        result.message = 'There has some system erro.';
    }
})

/**
 * 根据用户ID获取该用户下的所有汽车信息
 * @param res 
 * @param paramList 
 * @returns 
 */
const getCarList = async (res: Response, paramList: Array<number>): Promise<ResponseResult> => {
    const result = new ResponseResult(res.locals);
    let sql = `SELECT COUNT(id) AS count FROM car; SELECT c.*, b.brand FROM car c left join carbrand b ON c.brandId = b.id WHERE userId = ? ORDER BY name LIMIT ?,?`
    try {
        const data: any = await mySqlOperate.query(sql, paramList);
        if (data.length) {
            result.data = {
                total: data[0][0].count,
                list: data[1],
            };
        }
    } catch (error) {
        result.code = 0;
        result.message = 'There has some system error.';
        result.error = error;
        result.status = 400;
    }
    return result;
}

export default router;