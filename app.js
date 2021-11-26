require('./index');
require('./config/socket.config')
const path = require("path");
const {spawn} = require("child_process");

const db = (process.env.NODE_ENV === 'production') ? process.env.MONGO_URI : process.env.MONGO_TEST_URI;

const DB_NAME = db;
const ARCHIVE_PATH = path.join(__dirname, 'public', `${db}.gzip`);

const backupMongoDB = () => {
    const child = spawn('mongodump', [
        `--db=${DB_NAME}`,
        `--archive=${ARCHIVE_PATH}`,
        '--gzip',
    ]);

    child.stdout.on('data', (data) => {
        console.log('stdout:\n', data);
    });
    child.stderr.on('data', (data) => {
        console.log('stderr:\n', Buffer.from(data).toString());
    });
    child.on('error', (error) => {
        console.log('error:\n', error);
    });
    child.on('exit', (code, signal) => {
        if (code) console.log('Process exit with code:', code);
        else if (signal) console.log('Process killed with signal:', signal);
        else console.log('Backup is successfull ✅');
    });
}

// backupMongoDB();
// cron.schedule('*/5 * * * * *', () => backupMongoDB());


