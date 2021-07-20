/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-16 14:12:09
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-20 17:34:24
 */
import express, { Request, Response } from 'express'
import mySqlOperate from '../db/mysqlOperate';
import ResponResult from '../module/ResponResult';

const router = express.Router();

// 新建账单类型
router.post('/create', async (req: Request, res: Response) => {
    const result = new ResponResult(res.locals);
    let resCode = 200;
    const { type, note } = req.body;
    try {
        const maxSort = await getMaxSort(result);
        if (result.isOk) {
            const sql: string = `INSERT INTO billtype (id,type,sort,note) VALUES (?,?,?,?)`;
            const paramList = [null, type, maxSort + 1, note];
            const data: any = await mySqlOperate.query(sql, paramList);
            if (!data.affectedRows) {
                resCode = 400;
                result.isOk = false;
                result.message = 'There is no rows affected.';
            }
        } else {
            resCode = 400;
        }
    } catch (error) {
        resCode = 400;
        result.isOk = false;
        result.error = error;
        result.message = 'Create billtype failed.';
    } finally {
        res.status(resCode).send(result);
    }
});

// 获取排序的最大序号
const getMaxSort = async (result: ResponResult) => {
    let sort = null;
    const sql = `SELECT MAX(sort) AS maxsort FROM billtype`;
    try {
        const data = await mySqlOperate.query(sql, []);
        if (data.length) {
            sort = data[0].maxsort ? data[0].maxsort : 0;
        }
        result.isOk = true;
    } catch (error) {
        result.isOk = false;
        result.error = error;
        result.message = 'Get max sort failed.';
    } finally {
        return sort;
    }
}

// 查询账单类型
router.get('/select', async (req: Request, res: Response) => {
    const result = new ResponResult(res.locals);
    result.data = [];
    let resCode = 200;
    const sql = `SELECT * FROM billtype`;
    const paramList: Array<string> = [];
    try {
        const data = await mySqlOperate.query(sql, paramList);
        if (data.length) {
            result.data = data;
        }
    } catch (error) {
        resCode = 400;
        result.error = error;
        result.message = 'Select billtype failed.';
    }
    res.status(resCode).send(result);
})


export default router;