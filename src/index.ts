const {ApolloServer} = require('apollo-server-express')
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as mongoose from "mongoose";
import "reflect-metadata";
const resolvers = require("./resolvers");
const typeDefs = require('./typeDefs')
import {MyContext} from "./utils/isAuth";

dotenv.config();

const runServer = async () => {
    const app = express();

    app.use(cors({
        origin: [process.env.FRONT_URL!, 'https://studio.apollographql.com'],
        credentials: true,
    }));

    app.use(cookieParser());

    const server = new ApolloServer({
        resolvers,
        typeDefs,
        context( { req, res} : MyContext ) {
            return ({req, res});
        }
    });

    await server.start();

    server.applyMiddleware({ app, cors: false });

    app.listen(process.env.PORT, () => {
        console.log(`server started port ${process.env.PORT}`)
    });
}

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO!)
    .then(() => {
        console.log('mongo connected');
        runServer();
    })
    .catch(err => console.log(err))
