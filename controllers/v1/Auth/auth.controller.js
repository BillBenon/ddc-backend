const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const {USER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {API_RESPONSE, hashPassword} = require("../../../utils/common");
const {sendResetPasswordMail} = require("../../../utils/email");
const {ResetPassword} = require("../../../models/Auth/reset-password.model");
const { User, validateLogin, validateInitialResetPassword , validateResetPassword } = require("../../../models/User/user.model");
const { v4: uuid, validate: uuidValidate } = require('uuid');
const CryptoJS = require("crypto-js");

/**
 * @swagger
 *
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     description: User Login
 *     parameters:
 *       - name: body
 *         description: Fields for a UserLogin
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserLogin'
 *     responses:
 *       200:
 *         description: Created
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */
router.post('/login', async (req, res) => {
    try {
        const { error } = validateLogin(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.login, status: USER_STATUS_ENUM.ACTIVE }).populate('category');
        if (!user) {
           user = await User.findOne({ username: req.body.login, status: USER_STATUS_ENUM.ACTIVE }).populate('category');
           if (!user) return res.status(404).send(API_RESPONSE(false, 'Invalid Credentials', null, 500));
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword)
            return res.status(400).send(API_RESPONSE(false, 'Invalid PassCode or Password', null, 404));

            return res.send({
                id: user._id,
                category: user.category.name.toUpperCase(),
                token: user.generateAuthToken()
            });
    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'An error occurred', err.toString(), 500))
    }
});


router.post('/crypto-token', async (req, res) => {
    try {
        return res.send({
            encrpyted: CryptoJS.AES.encrypt(req.body.token, process.env.GLOBAL_KEY).toString(),
            decrypted: req.body.token
        }).status(200);
    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});






/**
 * @swagger
 * /api/v1/auth/reset-password/initial:
 *   post:
 *     tags:
 *       - Authentication
 *     description: Initiate User Reset Password
 *     parameters:
 *       - name: body
 *         description: InitialPasswordReset fields
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/InitialPasswordReset'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request | Validation Error
 *       500:
 *         description: Internal Server Error
 */
router.post('/reset-password/initial', async (req, res) => {
    try {
        const { error } = validateInitialResetPassword(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email, status: USER_STATUS_ENUM.ACTIVE })

        if (!user) return res.status(404).send(API_RESPONSE(false, 'User not found', null, 404));

        const exists = await ResetPassword.findOne({ user: user._id, reset: false });
        if (exists) return res.status(400).send(API_RESPONSE(false, 'User has a pending PasswordReset', null, 400));

        const date = new Date();
        const ONE_DAY = 24 * 60 * 60 * 1000;
        date.setTime((date.getTime() + (ONE_DAY)));
        const token = uuid();

        const resetPassword = new ResetPassword({
            user: user._id,
            token: token,
            expiration: date
        });
    
        await resetPassword.save();
        req.body.names = user.firstName + ' ' + user.lastName;
        req.body.token = token;
        await sendResetPasswordMail(req, res);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/auth/reset-password/resend-email:
 *   post:
 *     tags:
 *       - Authentication
 *     description: Resends the Email in case one did not receive the email
 *     parameters:
 *       - name: body
 *         description: Resend Verification Email fields
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/InitialPasswordReset'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request | Validation Error
 *       500:
 *         description: Internal Server Error
 */
router.post('/reset-password/resend-email', async (req, res) => {
    try {
        const { error } = validateInitialResetPassword(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        const user = await User.findOne({ email: req.body.email, status: USER_STATUS_ENUM.ACTIVE })
        if (!user) return res.status(404).send(API_RESPONSE(false, 'User not found', null, 404));
        
        let resetPassword = await ResetPassword.findOne({ user: user._id })
        if (!resetPassword) return res.status(404).send(API_RESPONSE(false, 'You have not been declared to reset password', null, 404));
        
        req.body.names = user.firstName + ' ' + user.lastName;
        req.body.token = resetPassword.token;
        await sendResetPasswordMail(req, res);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     description: User Reset Password
 *     parameters:
 *       - name: body
 *         description: PasswordReset fields
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/PasswordReset'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request | Validation Error
 *       500:
 *         description: Internal Server Error
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { error } = validateResetPassword(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        if(!uuidValidate(req.body.activationToken)) return res.status(400).send(API_RESPONSE(false, 'Invalid token', null, 404))
        
        req.body.token = req.body.activationToken
        
        const user = await User.findOne({ email: req.body.email, status: USER_STATUS_ENUM.ACTIVE })

        if (!user) return res.status(404).send(API_RESPONSE(false, 'User not found', null, 404));
		
        const reset = await ResetPassword.findOne({ token: req.body.token, reset: true });
        if (reset) return res.status(404).send(API_RESPONSE(false, 'PasswordReset Token has already been used', null, 404));

        const token = await ResetPassword.findOne({ token: req.body.token, reset: false });
        if (!token) return res.status(404).send(API_RESPONSE(false, 'PasswordReset Token not found', null, 404));

        if (token.expiration < Date.now()) { return res.status(400).send(API_RESPONSE(false, 'PasswordReset Token has expired', null, 400))}

        const hashedPassword = await hashPassword(req.body.password);

        await ResetPassword.findByIdAndUpdate(token._id, { reset: true }, { new: true });

        user.password = hashedPassword;
        const updatedUser = await user.save();

        if (!updatedUser) return res.status(500).send(API_RESPONSE(false, 'PasswordReset Failed', null, 500));
        return res.status(200).send(API_RESPONSE(false, 'PasswordReset Successful', null, 500));
    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});





module.exports = router;
