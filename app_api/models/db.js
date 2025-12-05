import mongoose from 'mongoose';
import readline from 'readline';

const dbURI = `mongodb+srv://kmj0410:${process.env.MONGODB_PASSWORD}@cluster0.cr2unvv.mongodb.net/Loc8r`

const connect = () => {
    console.log("몽고DB 연결 by 2025810083 강민준")
    setTimeout(() => mongoose.connect(dbURI), 1000);
};

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', err => {
    console.log('Mongoose connection error: ' + err);
    return connect();
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

if (process.platform === 'win32') {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('SIGINT', () => {
        process.emit('SIGINT');
    });
}

const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnected through ${msg}`);
        callback();
    });
};

process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});

process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    gracefulShutdown('Heroku app shutdown', () => {
        process.exit(0);
    });
});

connect();
// by 2025810083 강민준
import './locations.js';
import './users.js'