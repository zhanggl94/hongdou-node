const ACCESS_EXPTIME = 60 * 60; // 单位秒
export default {
    secret: 'I am a token secret.',
    accessExpTime: ACCESS_EXPTIME, // 单位秒 accesstoken过期时间
    refreshExpTime: 3 * ACCESS_EXPTIME // 单位秒 refreshtoken过期时间
}