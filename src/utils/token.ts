import {JwtPayload, sign, verify} from 'jsonwebtoken'

export interface UserType {
    _id: String
}

export const parseRefreshToken = (token: string) => {
    let error = null;
    let decodedToken: JwtPayload|String = {};

    verify(token, process.env.REFRESH_TOKEN_SECRET!, (err, decoded) => {
        if (err) {
            error = err
        }

        if (decoded) {
            decodedToken = decoded;
        }
    });

    return { error, decodedToken };
}

export const generateAccessToken = (id: String) => {
    return sign({
        id
    }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '1m'
    });
}

export const generateRefreshToken = (id: String) => {
    return sign({
        id
    }, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: '30d'
    });
}
