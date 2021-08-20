/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-08 11:27:45
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-08-20 17:31:26
 */
export const formatDateHour24 = (date: Date, timeZone: string): string => date.toLocaleString(timeZone, { hour12: false });

/**
 * 获取查询条件
 * @param body 查询请求的Body
 */
export const getQueryObject = (body:Array<any>) => {
    const queryObject = {
        keyList: new Array<string>(),
        operationList: new Array<string>(),
        valueList: new Array<string>()
    };
    if (body) {
        body.map((item: any) => {
            queryObject.keyList.push(item.key);
            queryObject.operationList.push(item.operation);
            queryObject.valueList.push(item.value);
        })
    }
    return queryObject;
}

/**
 * 获取拼接SQL
 * @param queryObejct 查询条件
 */
export const getSplicedSQL = (queryObejct: any, aliasList:Array<string>) => {
    let otherSql = '';
    if (queryObejct.keyList.length) {
        for (let i = 0; i < queryObejct.keyList.length; i++) {
            otherSql += ` AND ${aliasList[i]}.${queryObejct.keyList[i]} ${queryObejct.operationList[i]} ?`;
        }
    }
    return otherSql;
}