/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-28 15:58:14
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-29 17:20:54
 */

import express, { Request, Response } from 'express'
import mySqlOperate from '../../../db/mysqlOperate';
import ResponResult from '../../../module/ResponResult';
import CarBrand from '../../../module/bill/car/carbrand';

const router = express.Router();

// 查询汽车品牌
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
    let sql = `SELECT * FROM carbrand WHERE id = ? ORDER BY brand`;
    const paramList: Array<string> = [id];
    try {
        const data = await mySqlOperate.query(sql, paramList);
        if (data.length) {
            result.data = data[0];
        }
    } catch (error: any) {
        result.error = error;
        result.status = 400;
        result.message = 'Select carbrand failed.';
    }
}

// 翻页查询
const getPageList = async (result: ResponResult, pageIndex: number, pageSize: number) => {
    let sql = `SELECT COUNT(id) AS count FROM carbrand; SELECT * FROM carbrand ORDER BY brand LIMIT ?,?`;
    const paramList: Array<number> = [(pageIndex - 1) * pageSize, pageSize];
    try {
        const data = await mySqlOperate.query(sql, paramList);
        if (data.length) {
            result.data = {
                total: data[0][0].count,
                list: data[1]
            };
        }
    } catch (error: any) {
        result.error = error;
        result.status = 400;
        result.message = 'Select carbrand failed.';
    }
}

// 新建汽车品牌
router.post('/create', async (req: Request, res: Response) => {
    const result = new ResponResult(res.locals);
    const { brand, note } = req.body;
    try {
        if (result.code) {
            const sql: string = `INSERT INTO carbrand (id,brand,note) VALUES (?,?,?)`;
            const paramList = [null, brand, note];
            const data: any = await mySqlOperate.query(sql, paramList);
            if (!data.affectedRows) {
                result.status = 400;
                result.code = 0;
                result.message = 'There is no rows affected.';
            }
        } else {
            result.status = 400;
        }
    } catch (error: any) {
        result.status = 400;
        result.code = 0;
        result.error = error;
        result.message = 'Create carbrand failed.';
    } finally {
        res.status(result.status).send(result);
    }
});

// 编辑
router.put('/edit', async (req: Request, res: Response) => {
    const result = new ResponResult(res.locals);
    const carBrand = req.body as CarBrand;
    try {
        const sql: string = `UPDATE carbrand SET brand = ?, note = ? WHERE id = ?`;
        const paramList: Array<any> = [carBrand.brand, carBrand.note, carBrand.id]
        const data = await mySqlOperate.query(sql, paramList);
        if (!data.affectedRows) {
            result.status = 400;
            result.code = 0;
            result.message = 'Update carbrand type failed.';
        }
        result.data = carBrand;
    } catch (error: any) {
        result.status = 400;
        result.code = 0;
        result.error = error;
        result.message = 'Update carbrand type failed.';
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
            let sql: string = `DELETE FROM carbrand WHERE id IN (`;
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
                result.message = 'Delete carbrand type failed.';
            }
        } else {
            result.status = 400;
            result.code = 0;
            result.message = 'There is no id to delete.';
        }
    } catch (error: any) {
        result.status = 400;
        result.code = 0;
        result.error = error;
        result.message = 'Delete carbrand type failed.';
    } finally {
        res.status(result.status).send(result);
    }
})
export default router;