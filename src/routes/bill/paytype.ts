/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-28 10:51:37
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-28 11:09:06
 */
import express, { Request, Response } from 'express'
import mySqlOperate from '../../db/mysqlOperate';
import ResponResult from '../../module/ResponResult';
import PayType from '../../module/bill/PayType';

const router = express.Router();

// 查询支付类型
router.get('/select', async (req: Request, res: Response) => {
    let result = new ResponResult(res.locals);
    const { id, pageIndex, pageSize } = req.query;
    if (id) { // 当id存在时，需要根据id查询
        await getOne(result, id.toString())
    } else if (pageIndex && pageSize) {
        await getPageList(result, parseInt(pageIndex.toString()), parseInt(pageSize.toString()))
    } else {
        result.code = 0;
        result.message = 'Parameter is wrong.';
        result.status = 400;
    }
    res.status(result.status).send(result);
})


// 根据id，查询单条
const getOne = async (result: ResponResult, id: string) => {
    let sql = `SELECT * FROM paytype WHERE id = ? ORDER BY sort`;
    const paramList: Array<string> = [id];
    try {
        const data = await mySqlOperate.query(sql, paramList);
        if (data.length) {
            result.data = data[0];
        }
    } catch (error) {
        result.error = error;
        result.status = 400;
        result.message = 'Select paytype failed.';
    }
}

// 翻页查询
const getPageList = async (result: ResponResult, pageIndex: number, pageSize: number) => {
    let sql = `SELECT COUNT(id) AS count FROM paytype; SELECT * FROM paytype ORDER BY sort LIMIT ?,?`;
    const paramList: Array<number> = [(pageIndex - 1) * pageSize, pageSize];
    try {
        const data = await mySqlOperate.query(sql, paramList);
        if (data.length) {
            result.data = {
                total: data[0][0].count,
                list: data[1]
            };
        }
    } catch (error) {
        result.error = error;
        result.status = 400;
        result.message = 'Select paytype failed.';
    }
}

// 新建支付类型
router.post('/create', async (req: Request, res: Response) => {
    const result = new ResponResult(res.locals);
    const { type, note } = req.body;
    try {
        const maxSort = await getMaxSort(result);
        if (result.code) {
            const sql: string = `INSERT INTO paytype (id,type,sort,note) VALUES (?,?,?,?)`;
            const paramList = [null, type, maxSort + 1, note];
            const data: any = await mySqlOperate.query(sql, paramList);
            if (!data.affectedRows) {
                result.status = 400;
                result.code = 0;
                result.message = 'There is no rows affected.';
            }
        } else {
            result.status = 400;
        }
    } catch (error) {
        result.status = 400;
        result.code = 0;
        result.error = error;
        result.message = 'Create paytype failed.';
    } finally {
        res.status(result.status).send(result);
    }
});

// 编辑
router.put('/edit', async (req: Request, res: Response) => {
    const result = new ResponResult(res.locals);
    const payType = req.body as PayType;
    try {
        const sql: string = `UPDATE paytype SET type = ?, sort = ?, note = ? WHERE id = ?`;
        const paramList: Array<any> = [payType.type, payType.sort, payType.note, payType.id]
        const data = await mySqlOperate.query(sql, paramList);
        if (!data.affectedRows) {
            result.status = 400;
            result.code = 0;
            result.message = 'Update bill type failed.';
        }
        result.data = payType;
    } catch (error) {
        result.status = 400;
        result.code = 0;
        result.error = error;
        result.message = 'Update bill type failed.';
    } finally {
        res.status(result.status).send(result);
    }
})

// 删除
router.delete('/delete', async (req: Request, res: Response) => {
    const result = new ResponResult(res.locals);
    const { idList } = req.body;
    try {
        if (idList.length) {
            let ids = idList.toString();
            let sql: string = `DELETE FROM paytype WHERE id IN (`;
            for (let i = 0; i < idList.length; i++) {
                if (i === 0) {
                    sql += '?';
                } else {
                    sql += ',?'
                }
            }
            sql += `)`;
            const paramList: Array<number> = idList;
            const data = await mySqlOperate.query(sql, paramList);
            console.log('paramList:', typeof (paramList[0]))
            console.log('data:', data)
            if (!data.affectedRows) {
                result.status = 400;
                result.code = 0;
                result.message = 'Delete bill type failed.';
            }
        } else {
            result.status = 400;
            result.code = 0;
            result.message = 'There is no id to delete.';
        }
    } catch (error) {
        result.status = 400;
        result.code = 0;
        result.error = error;
        result.message = 'Delete bill type failed.';
    } finally {
        res.status(result.status).send(result);
    }
})

// 获取排序的最大序号
const getMaxSort = async (result: ResponResult) => {
    let sort = null;
    const sql = `SELECT MAX(sort) AS maxsort FROM paytype`;
    try {
        const data = await mySqlOperate.query(sql, []);
        if (data.length) {
            sort = data[0].maxsort ? data[0].maxsort : 0;
        }
        result.code = 1;
    } catch (error) {
        result.code = 0;
        result.error = error;
        result.status = 400;
        result.message = 'Get max sort failed.';
    } finally {
        return sort;
    }
}
export default router;