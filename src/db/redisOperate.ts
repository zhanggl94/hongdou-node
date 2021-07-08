import redisConfig from '../config/redis';
import redis from 'redis';

const client = redis.createClient({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password
});

client.on('ready', err => {
    if (err) {
        console.log('Redis ready error: ', err);
        return;
    }
    console.log('Redis ready.');
});

client.on('connect', err => {
    if (err) {
        console.log('Redis connect error: ', err);
        return;
    }
    console.log(('Redis connect success.'));
});

client.on('reconnecting', err => {
    if (err) {
        console.log('Redis reconnecting error: ', err);
        return;
    }
    console.log(('Redis reconnecting success.'));
});


client.on('error', err => {
    console.log('Redis reconnecting error: ', err);
});

client.on('end', err => {
    if (err) {
        console.log('Redis end error: ', err);
        return;
    }
    console.log(('Redis end success.'));
});

client.on('warning', war => {
    if (war) {
        console.log('Redis warning: ', war);
        return;
    }
    console.log(('Redis warning.'));
});

/**
 * redis set方法
 * @param key 
 * @param value 
 * @param timeout 
 * @returns 
 */
export const setRedis = (key: string, value: string, timeout: number = 0) => {
    return new Promise((resolve, reject) => {
        if (timeout > 0) { // 超时时间存在时，设置超时时间
            client.setex(key, timeout, value, (err, result) => {
                if (err) {
                    console.error('Redis setex error: ', err);
                    reject(err);
                    return;
                }
                resolve(result);
            });
        } else { // 超时时间不存在，直接设置key
            client.set(key, value, (err, result) => {
                if (err) {
                    console.error('Redis set error: ', err);
                    reject(err);
                    return;
                }
                resolve(result);
            });
        }
    });
}

/**
 * redis get方法
 * @param key 
 * @returns 
 */
export const getRedis = (key:string) => {
    return new Promise((resolve, reject) => {
        client.get(key, (err, result) => {
            if (err) {
                console.error('Redis get error: ', err);
                reject(err);
                return;
            }
            resolve(result);
        });
    })
}