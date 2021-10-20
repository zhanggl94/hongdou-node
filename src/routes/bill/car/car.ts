import express, { Request, Response } from 'express';
import { parse } from 'ts-node';
import mySqlOperate from '../../../db/mysqlOperate';
import Car from '../../../module/bill/car/car';
import ResponseResult from '../../../module/ResponResult';
import { getQueryObject, getSplicedSQL } from '../../../utils/util';

const router = express.Router();

/**
 * 创建汽车信息
 */
router.post('/create', async (req: Request, res: Response) => {
    const result = new ResponseResult(res.locals);
    const sql = `INSERT INTO car (name,brandId,isDefault,note, userId) VALUES (?,?,?,?,?)`;
    const car: Car = req.body as Car;
    try {
        if (Number(car.isDefault) === 1) {
            await setIsDefault(car.userId);
        }
        const paramList: Array<any> = [car.name, car.brand.id, car.isDefault, car.note, car.userId]
        const data: any = await mySqlOperate.query(sql, paramList);
        if (!data.affectedRows) {
            result.code = 0;
            result.message = 'Create car failed.';
            result.status = 400;
        }
        res.status(result.status).send(result);
    } catch (error: any) {
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
        if (!id && !pageIndex && !pageSize && userId) {
            result = await getUserDefaultCar(res, Number(userId))
        } else if (id && userId) {
            result = await getOneCar(res, Number(id), Number(userId))
        } else if (pageIndex && pageSize && userId) {
            const paramList = [parseInt(userId.toString()), parseInt(userId.toString()), (parseInt(pageIndex.toString()) - 1) * parseInt(pageSize.toString()), parseInt(pageSize.toString())]
            result = await getCarList(res, paramList)
        } else {
            result.code = 0;
            result.status = 405;
            result.message = 'The parameter is incorrect.';
        }
        res.status(result.status).send(result);
    } catch (error: any) {
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
    const car: Car = req.body as Car;
    const paramList = [car.name, car.brand.id, car.isDefault, car.note, car.id, car.userId];
    const sql = `UPDATE car SET name = ?, brandId = ?, isDefault = ?, note = ? WHERE id = ? AND userId = ?`;
    try {
        if (Number(car.isDefault) === 1) { // 当设置为默认值时，清除其他汽车的默认选项(默认汽车只有一辆)
            await setIsDefault(car.userId);
        }
        const data: any = await mySqlOperate.query(sql, paramList);
        let responseCode = 200;
        if (!data.affectedRows) {
            result.code = 0;
            result.message = 'Update car failed.';
            responseCode = 400;
        }
        res.status(responseCode).send(result);
    } catch (error: any) {
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
const setIsDefault = async (userId: number) => {
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
    } catch (error: any) {
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
    let sql = `SELECT COUNT(id) AS count FROM car WHERE userId = ?;
            SELECT c.id, c.name, c.isDefault, c.note, c.userId, c.brandId, b.brand, b.note AS bnote  FROM
            car c left join carbrand b ON c.brandId = b.id WHERE userId = ? ORDER BY c.name`
    try {
        const data: any = await mySqlOperate.query(sql, paramList);
        if (data.length) {
            const carList = data[1].reduce((acc: Array<any>, curr: any) => {
                const carInfo: Car = new Car();
                carInfo.id = curr.id
                carInfo.name = curr.name
                carInfo.isDefault = curr.isDefault
                carInfo.note = curr.note
                carInfo.brand.id = curr.brandId
                carInfo.brand.brand = curr.brand
                carInfo.brand.note = curr.bnote
                acc.push(carInfo)
                return acc;
            }, [])
            result.data = {
                total: data[0][0].count,
                list: carList,
            };
        }
    } catch (error: any) {
        result.code = 0;
        result.message = 'There has some system error.';
        result.error = error;
        result.status = 400;
    }
    return result;
}

/**
 * 获取一辆汽车信息
 * @param res 
 * @param carId 
 * @param userId 
 * @returns 
 */
const getOneCar = async (res: Response, carId: Number, userId: Number): Promise<ResponseResult> => {
    const result = new ResponseResult(res.locals);
    let sql = `SELECT c.id, c.name, c.isDefault, c.note, c.userId, c.brandId, b.brand, b.note AS bnote  FROM
            car c left join carbrand b ON c.brandId = b.id WHERE c.id = ? AND userId = ?`
    try {
        const paramList = [carId, userId]
        const data: any = await mySqlOperate.query(sql, paramList);
        if (data.length) {
            result.data = {
                id: data[0].id,
                name: data[0].name,
                isDefault: data[0].isDefault,
                note: data[0].note,
                userId: userId,
                brand: {
                    id: data[0].brandId,
                    brand: data[0].brand,
                    note: data[0].bnote
                }
            };
        }
    } catch (error: any) {
        result.code = 0;
        result.message = 'There has some system error.';
        result.error = error;
        result.status = 400;
    }
    return result;
}

/**
 * 获取用户的默认汽车信息
 * @param res 
 * @param carId 
 * @param userId 
 * @returns 
 */
const getUserDefaultCar = async (res: Response, userId: Number): Promise<ResponseResult> => {
    const result = new ResponseResult(res.locals);
    let sql = `SELECT c.id, c.name, c.isDefault, c.note, c.userId, c.brandId, b.brand, b.note AS bnote  FROM
            car c left join carbrand b ON c.brandId = b.id WHERE userId = ? AND c.isDefuault = 1`
    try {
        const paramList = [userId]
        const data: any = await mySqlOperate.query(sql, paramList);
        if (data.length) {
            result.data = {
                id: data[0].id,
                name: data[0].name,
                isDefault: data[0].isDefault,
                note: data[0].note,
                userId: userId,
                brand: {
                    id: data[0].brandId,
                    brand: data[0].brand,
                    note: data[0].bnote
                }
            };
        }
    } catch (error: any) {
        result.code = 0;
        result.message = 'There has some system error.';
        result.error = error;
        result.status = 400;
    }
    return result;
}

export default router;