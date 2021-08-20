/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-28 16:01:03
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-08-20 13:40:32
 */

import CarBrand from "./carbrand";

// 汽车信息
export default class Car {
    public id: number = 0;
    public name: string = '';
    public brand: CarBrand = new CarBrand();
    public isDefault: number = 0;
    public note: string = '';
    public userId: number = 0;
}