const mongoose = require("mongoose");
const {spawn} = require("child_process");
const path = require('path');
const db = (process.env.NODE_ENV === 'production') ? process.env.MONGO_URI : process.env.MONGO_TEST_URI;
const cron = require('node-cron');

mongoose.set('toObject', {virtuals: true});

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false,
        });
    } catch (err) {
        process.exit(1);
    }
};



connectDB().then();

