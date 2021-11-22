const jwt = require('jsonwebtoken')
const config = require('config');
const {EMPLOYEE_STATUS_ENUM} = require("../../utils/enumerations/constants");
const {USER_STATUS_ENUM} = require("../../utils/enumerations/constants");
const {Employee} = require('../../models/Employee/employees.model');
const {User} = require('../../models/User/user.model');

const CryptoJS = require("crypto-js");
const {API_RESPONSE} = require("../../utils/common");


const decryptToken = (encrypted) =>{
    if(!encrypted) return null;
    try {
        return {token: CryptoJS.AES.decrypt(encrypted, process.env.GLOBAL_KEY).toString(CryptoJS.enc.Utf8)};
    }
    catch (e) {
        return (API_RESPONSE(false,  'Invalid Token', null, 400))
    }
}



exports.AUTH_MIDDLEWARE = async (req, res, next) => {

    const header = req.header('Authorization');
    if (!header || !(header.startsWith('Bearer ')))
        return res.send(API_RESPONSE(false,  'No Token Found', null, 400)).status(401);

    const {token} = decryptToken(header.split(' ')[1]);
    if (!token) return res.send(API_RESPONSE(false,  'Invalid Bearer Token', null, 400)).status(401)

    try {
        const decoded = jwt.verify(token, config.get('KEY'));
        const user = await User.findOne({ _id: decoded.id, status: USER_STATUS_ENUM.ACTIVE }).populate('category')
        if (!user) return res.status(404).send(API_RESPONSE(false,  'Invalid User Account', null, 400));

        const userCategory = user.category.name;

        let AUTH_DATA = {};

        switch (userCategory) {
            case 'CUSTOMER':
                AUTH_DATA = {
                    USER_TYPE: userCategory,
                    USER_ID: user._id
                }
                break;
            case 'SYSTEM_ADMIN':
                AUTH_DATA = {
                    USER_TYPE: userCategory,
                    USER_ID: user._id
                }
                break;
            case 'EMPLOYEE':
                AUTH_DATA = {
                    USER_TYPE: userCategory,
                    EMPLOYEE_TYPE: await getEmployeeCategory(user._id),
                    USER_ID: user._id
                }
                break;
            case 'SHIPPER':
                AUTH_DATA = {
                    USER_TYPE: userCategory,
                    USER_ID: user._id
                }
                break;
            case 'SUPPLIER':
                AUTH_DATA = {
                    USER_TYPE: userCategory,
                    USER_ID: user._id
                }
                break;
        }

        req.AUTH_DATA = AUTH_DATA;
        next();
    }
    catch (err) {
        return res.send(API_RESPONSE(false,  'Invalid Bearer Token', null, 400)).status(400)
    }
}


const getEmployeeCategory = async (id) => {
    if (!id) return null;
    const employee = await Employee.findOne({user: id, status: EMPLOYEE_STATUS_ENUM.ACTIVE}).populate('employeeCategory');
    if (!employee.employeeCategory) return null;
    return  employee.employeeCategory.category;
}
