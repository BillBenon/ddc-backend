const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const { ResetPassword } = require("../models/Auth/reset-password.model");
const CryptoJS = require("crypto-js");

const transporter = nodemailer.createTransport({
	host: process.env.MAIL_APP_HOST,
    port: 465,
    auth: {
        user: process.env.MAIL_APP_EMAIL,
        pass: process.env.MAIL_APP_PASSWORD,
    },
});

const mailGenerator = new Mailgen({
	theme: "salted",
	product: {
		name: "Korea Auto Rwanda",
		link: "https://www.koreaautop.com",
		logo: "https://koreaautop.com/favicon_io/favicon-32x32.png",
	},
	body: {
		name: "You requested to change your password",
	},
});

exports.sendResetPasswordMail = async (req, res) => {
	try {
		const { email } = req.body;

		const encryPtedEmail = encodeURIComponent(
			CryptoJS.AES.encrypt(
				req.body.email,
				process.env.GLOBAL_KEY
			).toString()
		);

		const response = {
			body: {
				name: req.body.names,
				email,
				intro: "Someone hopefully you, has requested to reset the password for your account.<br>",
				action: {
					instructions: "Click to complete the process",
					button: {
						color: "#3f51b5",
						text: "Reset Your Password",
						link:
							"https://www.koreaautop.com/auth/reset-password?subject=" +
							encryPtedEmail +
							"&" +
							"token=" +
							req.body.token,
					},
				},
				outro: "This code expires after 24 Hours !",
			},
		};

		const mail = mailGenerator.generate(response);

		const message = {
			from: process.env.MAIL_APP_EMAIL,
			to: email,
			subject: "Reset Password",
			html: mail,
		};

		const sent = await transporter.sendMail(message);

		if (sent)
			return res
				.status(200)
				.send({ message: `We've sent an email to !!` });

		return res.status(500).send({ message: "Email was not sent" });
	} catch (err) {
		const deleted = await ResetPassword.findOneAndDelete(req.body.token);
		if (deleted)
			return res
				.status(500)
				.send({ error: err.toString(), message: "Email was not sent" });
	}
};
