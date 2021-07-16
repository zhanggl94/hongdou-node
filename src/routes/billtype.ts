/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-16 14:12:09
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-16 17:42:40
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
            const sql: string = `INSERT INTO billtype (id,type,sort,note) VALULES (?,?,?,?)`;
            const paramList = [null, type, maxSort, note];
            const data:any = await mySqlOperate.query(sql,paramList);
            if(!data.affectedRows){
                resCode = 400;
                result.isOk = false;
                result.message = 'Create billtype failed.';
            }
        } else {
            resCode = 400;
        }
    } catch (error) {
        resCode = 400;
        result.error = error;
    } finally {
        res.status(resCode).send(result);
    }
});

// 获取排序的最大序号
const getMaxSort = async (result: ResponResult) => {
    let sort = 0;
    const sql = `SELECT MAX(sort) FROM billtype`;
    try {
        const data = await mySqlOperate.query(sql, []);
        if (data.length) {
            console.log('data0: ', data[0]);
            sort = data[0];
        }
        result.isOk = true;
    } catch (error) {
        result.isOk = false;
        result.error = error;
    } finally {
        return sort;
    }
}

export default router;