import {compare, hash} from "bcryptjs";
import {generateAccessToken, generateRefreshToken, parseRefreshToken, UserType} from "../utils/token";
import {Response} from "express";
import {MyContext} from "../utils/isAuth";
const { UserInputError } = require('apollo-server')
const { validateRegister, validateLogin } = require('../utils/validate')

const User = require('../../mongo/User');

type RegisterInput = {
    email: string,
    password: string,
    confirmPassword: string
}

type LoginInput = {
    email: string,
    password: string,
}

const setRefreshToken = (res: Response, id: String) => {
    res.cookie(
        'rfrTkn',
        generateRefreshToken(id),
        {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    );
}

module.exports = {
    Query: {
        getAllUsers: async (_: any, args: any) => {
            return await User.find();
        }
    },
    Mutation: {
         register: async (_: any, { email, password, confirmPassword }: RegisterInput, { req, res }: MyContext ) => {
            const validatedInput = validateRegister(email, password, confirmPassword);

            for (let errorKey in validatedInput) {
                if (validatedInput[errorKey].length) {
                    throw new UserInputError('User Input Error', {
                        errorContent: {
                            [errorKey]: validatedInput[errorKey]
                        }
                    })
                }
            }

            const user = await User.findOne({ email });

            if (user) {
                throw new UserInputError('User Input Error', {
                    errorContent: {
                        email: 'This email is already used'
                    }
                })
            }

            password = await hash(password, 12);

            const newUser = new User({
                email,
                password
            });

            const userResponse = await newUser.save();

            const token = generateAccessToken(userResponse._id);

             setRefreshToken(res, userResponse._id);

             return {
                ...userResponse._doc,
                id: userResponse._id,
                token
            }
        },
        async login (_: any, { email, password }: LoginInput, { req, res }: MyContext) {
            const validatedInput = validateLogin(email, password);

            for (let errorKey in validatedInput) {
                if (validatedInput[errorKey].length) {
                    throw new UserInputError('User Input Error', {
                        errorContent: {
                            [errorKey]: validatedInput[errorKey]
                        }
                    })
                }
            }

            const user = await User.findOne({ email });

            if (!user) {
                throw new UserInputError('User not found', {
                    errorContent: {
                        email: 'Email or password is wrong'
                    }
                });
            }

            const passwordMatch = await compare(password, user.password);

            if (!passwordMatch) {
                throw new UserInputError('Wrong credentials', {
                    errorContent: {
                        email: 'Email or password is wrong'
                    }
                });
            }

            const token = generateAccessToken(user._id);

            setRefreshToken(res, user._id);

            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
        async refresh (_: any, __: any, { req, res }: MyContext) {
             if (req.cookies.rfrTkn) {
                 const { error, decodedToken } = parseRefreshToken(req.cookies.rfrTkn)

                 if (error) {
                     throw new UserInputError('Failed refreshing token', {
                         errorContent: {
                             refreshToken: 'Failed refreshing token'
                         }
                     });
                 }

                 if (decodedToken.id && decodedToken.exp! > (new Date().getTime()) / 1000) {
                     const token = generateAccessToken(decodedToken.id);

                     setRefreshToken(res, decodedToken.id);

                     return {
                         token
                     }
                 }

                 return {
                     token: null
                 };
             }

            return {
                token: null
            };

        }
    }
};
