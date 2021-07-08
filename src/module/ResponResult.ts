export default class ResponResult {
    public isOk: boolean = true;
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