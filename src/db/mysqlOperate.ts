import mysql from 'mysql';
import mysqlConfig from '../config/mysql';

const mySqlOperate: any = {};
const pool = mysql.createPool(mysqlConfig);

//使用mysql的连接池功能
mySqlOperate.query = (sql: string, paramList: Array<any>): Promise<any> => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, paramList, (err, data) => {
                    // console.log(`sql: ${sql}, paramList: ${paramList}`); 查看执行的SQL语句
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
                connection.release();
            }
        });
    })
}

export default mySqlOperate;