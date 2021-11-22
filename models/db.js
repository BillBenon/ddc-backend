const mongoose = require("mongoose");

const db = (process.env.NODE_ENV === 'production') ? process.env.MONGO_URI : (process.env.NODE_ENV === 'production') ? process.env.MONGO_TEST_URI : 'mongodb://localhost:27017/KOREA_AUTO_RWANDA_ECOMMERCE_DB';

mongoose.set('toObject', { virtuals: true });

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
