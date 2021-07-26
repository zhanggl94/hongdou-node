/*
 * @Description: 
 * @Version: 2.0
 * @Autor: zhanggl
 * @Date: 2021-07-08 11:27:45
 * @LastEditors: zhanggl
 * @LastEditTime: 2021-07-26 15:24:46
 */
export default class ResponResult {
    public code: number = 1; // 0失败, 1成功
    public status: number = 200; // 网络请求结果
    public error: object = {};
    public message: string = '';
    public data: any;
    public jwtToken: string = '';
    public isRefreshClientToken: boolean = false;
    public jwtRefreshToken: string = '';

    constructor(locals: any) {
        this.isRefreshClientToken = locals.isRefreshClientToken;
        this.jwtRefreshToken = locals.jwtRefreshToken;
    }
}