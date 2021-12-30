const multer = require('multer');
const {promisify} = require('util')
const fs = require('fs');
const unlinkAsync = promisify(fs.unlink);
const {v4: uuid} = require('uuid');

const maxSize = 100000000
const ROOT_PATH = process.env.PROD_ROOT_PATH;

const categoriesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const PATH = ROOT_PATH + 'images/general-category-profiles';
        try {
            if (fs.existsSync(PATH)) {
                cb(null, PATH)
            } else {
                fs.mkdirSync(PATH, {recursive: true});
                cb(null, PATH)
            }
        } catch (e) {
            console.error(e)
        }
    },
    filename: function (req, file, cb) {
        const id = req.path.substring(req.path.lastIndexOf('/'));
        cb(null, 'general-category-' + id.substring(1) + '.' + file.originalname.split('.').pop());
    }
});


const companyLogoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const PATH = ROOT_PATH + 'images/company-logos';
        try {
            if (fs.existsSync(PATH)) {
                cb(null, PATH)
            } else {
                fs.mkdirSync(PATH, {recursive: true});
                cb(null, PATH)
            }
        } catch (e) {
            console.error(e)
        }
    },
    filename: function (req, file, cb) {
        const id = req.path.substring(req.path.lastIndexOf('/'));
        cb(null, 'company-' + id.substring(1) + '.' + file.originalname.split('.').pop());
    }
});


const appUpdateStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const PATH = ROOT_PATH + 'images/app-updates';
        try {
            if (fs.existsSync(PATH)) {
                cb(null, PATH)
            } else {
                fs.mkdirSync(PATH, {recursive: true});
                cb(null, PATH)
            }
        } catch (e) {
            console.error(e)
        }
    },
    filename: function (req, file, cb) {
        const id = req.path.substring(req.path.lastIndexOf('/'));
        cb(null, 'app-update-' + id.substring(1) + '.' + file.originalname.split('.').pop());
    }
});


const userProfileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const PATH = ROOT_PATH + 'images/user-profiles';
        try {
            if (fs.existsSync(PATH)) {
                cb(null, PATH)
            } else {
                fs.mkdirSync(PATH, {recursive: true});
                cb(null, PATH)
            }
        } catch (e) {
            console.error(e)
        }
    },
    filename: function (req, file, cb) {
        const id = req.path.substring(req.path.lastIndexOf('/'));
        cb(null, 'user-' + id.substring(1) + '.' + file.originalname.split('.').pop());
    }
});


const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const PATH = ROOT_PATH + 'images/products';
        try {
            if (fs.existsSync(PATH)) {
                cb(null, PATH)
            } else {
                fs.mkdirSync(PATH, {recursive: true});
                cb(null, PATH)
            }
        } catch (e) {
            console.error(e)
        }
    },
    filename: function (req, file, cb) {
        const id = uuid();
        cb(null, 'order-' + id + '.' + file.originalname.split('.').pop());
    }
});



const categoryfileFilter = async (req, file, cb) => {
    // reject a file
    const id = req.path.substring(req.path.lastIndexOf('/'));
    const filename = ROOT_PATH + 'images/general-category-profiles/' + 'general-category-' + id.substring(1) + '.' + file.originalname.split('.').pop();
    if (fs.existsSync(filename)) {
        await unlinkAsync(filename);
    }
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const companyLogofileFilter = async (req, file, cb) => {
    // reject a file
    const id = req.path.substring(req.path.lastIndexOf('/'));
    const filename = ROOT_PATH + 'images/company-logos/' + 'company-' + id.substring(1) + '.' + file.originalname.split('.').pop();
    if (fs.existsSync(filename)) {
        await unlinkAsync(filename);
    }
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};


const appUpdateFileFilter = async (req, file, cb) => {
    // reject a file
    const id = req.path.substring(req.path.lastIndexOf('/'));
    const filename = ROOT_PATH + 'images/app-updates/' + 'app-update-' + id.substring(1) + '.' + file.originalname.split('.').pop();
    if (fs.existsSync(filename)) {
        await unlinkAsync(filename);
    }
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};


const userProfileFileFilter = async (req, file, cb) => {
    // reject a file
    const id = req.path.substring(req.path.lastIndexOf('/'));
    const filename = ROOT_PATH + 'images/user-profiles/' + 'user-' + id.substring(1) + '.' + file.originalname.split('.').pop();
    if (fs.existsSync(filename)) {
        await unlinkAsync(filename);
    }
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};


const sparePartFileFilter = async (req, file, cb) => {
    // reject a file
    const id = req.path.substring(req.path.lastIndexOf('/'));

    const filename = ROOT_PATH + 'images/products/' + 'product-' + id.substring(1) + '.' + file.originalname.split('.').pop();
    if (fs.existsSync(filename)) {
        await unlinkAsync(filename);
    }
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};


exports.uploadCategory = multer({
    storage: categoriesStorage,
    limits: {
        fileSize: maxSize
    },
    fileFilter: categoryfileFilter
});


exports.uploadAppUpdate = multer({
    storage: appUpdateStorage,
    limits: {
        fileSize: maxSize
    },
    fileFilter: appUpdateFileFilter
});

exports.uploadCompanyLogo = multer({
    storage: companyLogoStorage,
    limits: {
        fileSize: maxSize
    },
    fileFilter: companyLogofileFilter
});


exports.uploadUserProfile = multer({
    storage: userProfileStorage,
    limits: {
        fileSize: maxSize
    },
    fileFilter: userProfileFileFilter
});

exports.uploadProductPic = multer({
    storage: productStorage,
    limits: {
        fileSize: maxSize
    },
    fileFilter: sparePartFileFilter
});



