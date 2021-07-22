/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-16 14:12:09
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-22 17:48:30
 */
import express, { Request, Response } from 'express'
import mySqlOperate from '../db/mysqlOperate';
import ResponResult from '../module/ResponResult';
import Billtype from '../module/Billtype';

const router = express.Router();

// 查询账单类型
router.get('/select', async (req: Request, res: Response) => {
    const result = new ResponResult(res.locals);
    const paramList: Array<any> = [];
    let sql = `SELECT * FROM billtype `;
    const { id } = req.query;
    if (id) { // 当id存在时，需要根据id查询
        sql += ` WHERE id = ?`
        paramList.push(id);
    }
    sql += `ORDER BY sort`;
    result.data = [];
    let resCode = 200;
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

// 编辑
router.put('/edit', async (req: Request, res: Response) => {
    const result = new ResponResult(res.locals);
    let resCode = 200;
    const billType = req.body as Billtype;
    try {
        const sql: string = `UPDATE billtype SET type = ?, sort = ?, note = ? WHERE id = ?`;
        const paramList: Array<any> = [billType.type, billType.sort, billType.note, billType.id]
        const data = await mySqlOperate.query(sql, paramList);
        if (!data.affectedRows) {
            resCode = 400;
            result.isOk = false;
            result.message = 'Update bill type failed.';
        }
        result.data = billType;
    } catch (error) {
        resCode = 400;
        result.isOk = false;
        result.error = error;
        result.message = 'Update bill type failed.';
    } finally {
        res.status(resCode).send(result);
    }
})

// 删除
router.delete('/delete', async (req: Request, res: Response) => {
    const result = new ResponResult(res.locals);
    let resCode = 200;
    const { idList } = req.body;
    try {
        if (idList.length) {
            const sql: string = `DELETE FROM billtype WHERE id IN (?) `;
            const paramList: Array<number> = idList
            const data = await mySqlOperate.query(sql, paramList);
            if (!data.affectedRows) {
                resCode = 400;
                result.isOk = false;
                result.message = 'Delete bill type failed.';
            }
        } else {
            resCode = 400;
            result.isOk = false;
            result.message = 'There is no id to delete.';
        }
    } catch (error) {
        resCode = 400;
        result.isOk = false;
        result.error = error;
        result.message = 'Delete bill type failed.';
    } finally {
        res.status(resCode).send(result);
    }
})


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


// const selectBillType = async(result:ResponResult)=>{

// }

export default router;