import crypto from 'crypto';

/**
 * 对字符串加密
 * @param str 
 * @param method 
 * @param format 
 */
const hash = (str: string, method?: string, format?: any): string => crypto.createHash(method || 'md5')
    .update(str).digest(format || 'hex');

/**
 * 密码加盐加密
 * @param password 
 * @param salt 
 */
export const cryPassword = (password: string, salt: string): string => hash(password + hash(salt, 'SHA256').slice(2, 12));