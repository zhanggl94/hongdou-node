import { Request, Response } from 'express';
import { verifyToken } from '../utils/jwtUtil';
import constants from '../utils/constants';
import { constant } from 'lodash';

const auth = async (req: Request, res: Response, next: Function) => {
    if (req.url !== '/api/signin' && req.url !== '/api/signup') {
        const token: string = req.headers.jwttoken as string;
        try {
            const result: any = await verifyToken(token);
            if (result.isRefreshClientToken) {
                res.locals = {
                    isRefreshClientToken: result.isRefreshClientToken,
                    jwtRefreshToken: result.data
                };
            }
            next();
        } catch (error) {
            if (error.name === constants.token_expired_error) {
                res.status(401).send({ isOk: false, error, message: 'Token has expired, please login agin.' });
            } else {
                res.status(401).send({ isOk: false, error, message: 'Token verify failed.' });
            }
        }
    } else {
        next();
    }
}

export default auth;