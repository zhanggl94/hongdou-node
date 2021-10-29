/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-08 11:27:45
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-26 16:14:48
 */
import mysql from 'mysql';
import mysqlConfig from '../config/mysql';
import constants from '../utils/constants';
import { formatDateHour24 } from '../utils/util';

const mySqlOperate: any = {};
const pool = mysql.createPool(mysqlConfig);

//使用mysql的连接池功能
mySqlOperate.query = (sql: string, paramList: Array<any>): Promise<any> => {
    console.log(`${formatDateHour24(new Date(), constants.time_zone_zh_cn)} -- sql: ${sql}, paramList: ${paramList}`); //查看执行的SQL语句
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, paramList, (err, data) => {
                    if (err) {
                        // console.log('sql query error: ', err)
                        reject(err);
                    } else {
                        // console.log('sql query success: ', data)
                        resolve(data);
                    }
                });
                connection.release();
            }
        });
    })
}

export default mySqlOperate;