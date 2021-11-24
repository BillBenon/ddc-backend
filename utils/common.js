const ObjectId = require('mongoose').Types.ObjectId;
const {promisify} = require('util');
const fs = require('fs');
const _ = require('lodash');
const unlinkAsync = promisify(fs.unlink);
const bcrypt = require('bcryptjs')
const {DURATION_TYPE_ENUM} = require("./enumerations/constants");
const cloudinary = require("cloudinary").v2;

const BASE_DIR = '../../';


exports.cloudinary_configuration = cloudinary.config({
    cloud_name:'ddc-application',
    api_key:'913255555598951',
    api_secret:'fEXCMnUCsbZcB4qLrbpOU66yRjA'
})


exports.fileUnlink = async (PATH_DIRECTORY, file_prefix, file) => {
    const filename = BASE_DIR + PATH_DIRECTORY + file;
    if (fs.existsSync(filename)) {
        await unlinkAsync(filename);
    }
}

/**
 * Checks for valid Object Id
 * @param id
 * @returns {boolean}
 */
exports.validObjectId = (id) => {
    return ((ObjectId.isValid(id)));
};

/**
 * Returns Object Values as Enum
 * @type {*[]}
 */
exports.getEnumFromObject = (obj) => {
    return Object.keys(obj)
        .map((key) => {
            return obj[key]
        });
}


/**
 * Get Total Order Price
 * @param delivery
 * @param orderPrice
 * @param total_discount
 * @returns {number}
 */
exports.getTotalAmount = (delivery, orderPrice, total_discount) => {
    orderPrice -= total_discount;
    if (orderPrice < 0) return 0;
    const totalDelivery = (delivery) ? delivery : 0;
    return orderPrice + totalDelivery;
}


/**
 * GET API RESPONSE
 * @param success
 * @param message
 * @param err
 * @param status
 * @param extra
 * @returns object
 * @constructor
 */
exports.API_RESPONSE = (success, message, err, status, extra = null) => {
    if (success) return {success: success, message: message.toUpperCase(), status: status, extra}
    return {success: success, message: message.toUpperCase(), error: err, status: status, extra}
}


exports.toTimestamp = () => {
    const date = new Date();
    date.setTime((date.getTime() + (24 * 60 * 60 * 1000)));

    return (Date.parse(date)) / 1000;
}


exports.fileFromPathUnlink = async (PATH) => {
    try {
        const FULL_PATH = PATH;
        if (fs.existsSync(FULL_PATH)) {
            await unlinkAsync(FULL_PATH);
            return {success: true, message: 'File Deleted Successfully'};
        } else return null;
    } catch (e) {
        return null;
    }
}


/**
 * Check if documents has dependencies
 * @param Model
 * @param field
 * @param value
 * @param nested
 * @returns {Promise}
 */
exports.dependencyChecker = async (Model, field, value, nested = false) => {
    try {
        if (!nested)
            return await Model.findOne({[field]: value, active: true});
        return await Model.findOne({field: value, active: true});
    } catch (e) {
        return null;
    }
}


/**
 * Hash Password
 * @param password
 * @returns {Promise<*>}
 */
exports.hashPassword = async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt);
}


/**
 * Get Aggregated Data
 * @param array
 * @returns {any}
 */
exports.getTranspiledData = (array) => {
    return _.merge(...array)
}

exports.getDuration = (start, type) => {
    const now = new Date();
    const delta = now.getTime() - start.getTime();
    if (type === DURATION_TYPE_ENUM.SECONDS) {
        return delta / 1000;
    } else if (type === DURATION_TYPE_ENUM.MINUTES) {
        return (delta / 1000) / 60;
    } else if (type === DURATION_TYPE_ENUM.HOURS) {
        return (delta / 1000) / 3600;
    } else if (type === DURATION_TYPE_ENUM.DAYS) {
        return (delta / 1000) / 86400;
    } else if (type === DURATION_TYPE_ENUM.WEEKS) {
        return (delta / 1000) / 604800;
    } else if (type === DURATION_TYPE_ENUM.MONTHS) {
        return (delta / 1000) / 2419200;
    } else if (type === DURATION_TYPE_ENUM.YEARS) {
        return (delta / 1000) / 29030400;
    }
}

//note: month is 0 based, just like Dates in js
const getWeekOfMonth = (year, month) => {
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let dayOfWeek = firstDay.getDay();
    let start;
    let end;

    for (let i = 1; i < daysInMonth + 1; i++) {

        if (dayOfWeek === 0 || i === 1) {
            start = i;
        }

        if (dayOfWeek === 6 || i === daysInMonth) {

            end = i;

            if (start !== end) {

                weeks.push({
                    start: start,
                    end: end
                });
            }
        }

        dayOfWeek = new Date(year, month, i).getDay();
    }
    return weeks;
}


const getWeekRange = (mapping, day) => {
    return mapping.findIndex(elem => (day >= elem.start) && (day <= elem.end));
}

exports.generateOrderCode = () => {
    const characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    let code = 'ORD-';
    for (let i = 0; i < 3; i++) {
        code += Math.floor(Math.random() * 10);
    }
    for (let i = 0; i < 3; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

exports.generateCarOrderCode = () => {
    const characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    let code = 'CAR-ORDER-';
    for (let i = 0; i < 3; i++) {
        code += Math.floor(Math.random() * 10);
    }
    for (let i = 0; i < 3; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

exports.generateCouponCode = () => {
    const characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    let code = 'KAP-';
    for (let i = 0; i < 4; i++) {
        code += Math.floor(Math.random() * 10);
    }
    for (let i = 0; i < 4; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}


exports.generateBookingCode = () => {
    const characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    let code = 'BOOK-';
    for (let i = 0; i < 3; i++) {
        code += Math.floor(Math.random() * 10);
    }
    for (let i = 0; i < 3; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

exports.existsInRange = (range, year) => {
    return year >= range.start && year <= range.end;
}

const encodeUrl = (uri) => {
    return encodeURIComponent(uri);
}


exports.appendFileUrl = (entity, prop, paginated = false) => {
    const isArray = entity instanceof Array;
    const HOST = process.env.PROD_URL;

    if (!paginated) {
        if (isArray) {
            const instances = JSON.parse(JSON.stringify(entity));
            for (let en of instances) {
                en.imageUrl = HOST + '/api/files/load/' + encodeUrl(en[prop]);
            }
            return instances;
        } else {
            entity = JSON.parse(JSON.stringify(entity));
            entity.imageUrl = HOST + '/api/files/load/' + encodeUrl(entity[prop]);
            return entity;
        }
    } else {
        const instances = JSON.parse(JSON.stringify(entity));

        for (let en of instances.docs) {
            en.imageUrl = HOST + '/api/files/load/' + encodeUrl(en[prop]);
        }
        console.log(instances)
        return instances;
    }
}


exports.appendSparePartImages = (entity, paginated = false) => {
    const isArray = entity instanceof Array;
    const HOST = process.env.PROD_URL;

    if (!paginated) {
        if (isArray) {
            const instances = JSON.parse(JSON.stringify(entity));
            for (let en of instances) {
                en.imageUrls = [];
                for (const image of en.photos) {
                    en.imageUrls.push(HOST + '/api/files/load/' + encodeUrl(image.path))
                }
            }
            return instances;
        } else {
            entity = JSON.parse(JSON.stringify(entity));
            entity.imageUrls = [];
            if (entity.photos) {
                for (const image of entity.photos) {
                    entity.imageUrls.push(HOST + '/api/files/load/' + encodeUrl(image.path))
                }
            }
            return entity;
        }
    } else {
        const instances = JSON.parse(JSON.stringify(entity));
        for (let en of instances.docs) {
            en.imageUrls = [];

            for (const image of en.photos) {
                en.imageUrls.push(HOST + '/api/files/load/' + encodeUrl(image.path))
            }
        }
        return instances;
    }
}

exports.appendSparePartImagesFromStock = (entity, paginated = false) => {
    const isArray = entity instanceof Array;
    const HOST = process.env.PROD_URL;

    if (!paginated) {
        if (isArray) {
            const instances = JSON.parse(JSON.stringify(entity));
            for (let en of instances) {
                en.imageUrls = [];
                if (en.part_in_stock) {
                    if (en.part_in_stock.spare_part) {
                        for (const image of en.part_in_stock.spare_part.photos) {
                            en.imageUrls.push(HOST + '/api/files/load/' + encodeUrl(image.path))
                        }
                    }
                }
            }
            return instances;
        } else {
            entity = JSON.parse(JSON.stringify(entity));
            entity.imageUrls = [];
            if (entity.part_in_stock) {
                if (entity.part_in_stock.spare_part) {

                    for (const image of entity.part_in_stock.spare_part.photos) {
                        entity.imageUrls.push(HOST + '/api/files/load/' + encodeUrl(image.path))
                    }
                }
            }
            return entity;
        }
    } else {
        const instances = JSON.parse(JSON.stringify(entity));
        for (let en of instances.docs) {
            en.imageUrls = [];
            if (en.part_in_stock) {
                if (en.part_in_stock.spare_part) {
                    for (const image of en.part_in_stock.spare_part.photos) {
                        en.imageUrls.push(HOST + '/api/files/load/' + encodeUrl(image.path))
                    }
                }
            }
        }
        return instances;
    }
}

exports.decodeURI = (uri) => {
    return decodeURIComponent(uri);
}


exports.generateCode = () => {
    let result = '';
    const characters = '0123456789';
    const len = characters.length;

    for (let i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * len));
    }

    return result;
}


exports.exists = (arr, prop, val) => {
    return arr.some(value => value[prop] === val);
}

exports.shuffle = (arr) => {

    let currIndex = arr.length;
    let randIndex;


    while (0 !== currIndex) {
        randIndex = Math.floor(Math.random() * currIndex);
        currIndex--;

        // And swap it with the current element.
        [arr[currIndex], arr[randIndex]] = [
            arr[randIndex], arr[currIndex]];
    }

    return arr;
}


exports.range = (min, max, zeros = false) => {
    return Array(max - min + 1)
        .fill(0)
        .map((_, i) => (zeros) ? 0 : i + min);
}

exports.immutate = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

exports.genTimestamps = () => {

    const TODAY = new Date();
    const MONTH = TODAY.getUTCMonth();
    const YEAR = TODAY.getUTCFullYear();
    const DAY = TODAY.getUTCDate();
    const weekMappings = getWeekOfMonth(YEAR, MONTH);

    const WEEK = getWeekRange(weekMappings, DAY);

    return [DAY, WEEK, MONTH, YEAR];
}

const errorResponseHandler = (message, data = null, status = 200) => {
    return {success: false, message, data, status}
}

exports.requestHandler = (handler) => {
    return async function (req, res) {
        try {
            return await handler(req, res)
        } catch (e) {
            return res.status(500).send(errorResponseHandler("Internal Server Error", e.toString(), 500))
        }
    }
}

exports.getWeekOfMonth = getWeekOfMonth;
exports.getWeekRange = getWeekRange;

exports.encodeUrl = encodeUrl;