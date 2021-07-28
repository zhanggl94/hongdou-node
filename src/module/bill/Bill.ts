export default class Bill {
    public id = 0; // id
    public carInfo:any; // 汽车信息
    public date = ''; // 日期
    public billType = ''; // 账单类型
    public payType = ''; // 支付种类
    public actual = 0; // 实际花费金额
    public discount = 0; // 优惠金额
    public total = 0; // 总金额
    public unitPrice = 0; // 单价
    public place = ''; // 地点
    public note = ''; // 备注
    public userId = ''; // 用户Id
} 