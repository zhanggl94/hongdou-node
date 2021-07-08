import jwt from 'jsonwebtoken';
import tokenConfig from '../config/token';
import { setRedis, getRedis } from '../db/redisOperate';
import constants from '../utils/constants';

/**
 * 创建token
 * @param payload 
 * @returns 
 */
export const createToken = (payload: any) => {
    console.log('payload', payload);
    payload.iat = Date.now();
    payload.exp = Math.floor(Date.now() / 1000) + tokenConfig.accessExpTime;
    setTokenToRedis(payload.username);
    return jwt.sign(payload, tokenConfig.secret);
}

/**
 * 验证token
 * @param token 
 * @returns 
 */
export const verifyToken = (token: string) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, tokenConfig.secret, async (err: any, data) => {
            console.log('decode', jwt.decode(token))
            if (err) {
                if (err.name === constants.token_expired_error) {
                    // 需要解析出token中的信息并重新生成token
                    const tokenJSON: any = jwt.decode(token);
                    if (await isRefreshTokenExist(tokenJSON.username)) {
                        const jwtRefreshToken = createToken({ username: tokenJSON.username, userid: tokenJSON.userid });
                        resolve({ isRefreshClientToken: true, data: jwtRefreshToken });
                    } else {
                        reject(err);
                    }
                }
                reject(err);
            } else {
                resolve({ isRefresClientToken: false, data: data });
            }
        });
    });
}

/**
 * 根据用户名判断该用户名的RefreshToken是否存在
 * @param userName 用户名
 * @returns 该是否存在RefreshToken
 */
const isRefreshTokenExist = async (userName: string): Promise<boolean> => {
    const refreshToken = await getTokenFromRedis(userName);
    if (refreshToken) {
        return true;
    } else {
        return false;
    }
}

/**
 * 将Token放到Redis中
 * @param username 用户名
 * @returns 
 */
const setTokenToRedis = (username: string) => setRedis(username, 'refreshToken', tokenConfig.refreshExpTime);

/**
 * 根据用户名称从redis中获取该用户名的redis值
 * @param username 用户名
 * @returns redis值
 */
const getTokenFromRedis = async (username: string) => await getRedis(username);
