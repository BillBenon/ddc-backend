const { v4: uuid } = require('uuid');


exports.generateRandomUUID = () => {
    return uuid();
}