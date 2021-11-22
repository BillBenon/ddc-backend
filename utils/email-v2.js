const _jade = require('jade');
const fs = require('fs');

const nodemailer = require("nodemailer");
const CryptoJS = require("crypto-js");

const emailsTemplateFolder = process.cwd() + "/emails/bookings/"

const encryptedUrl = (url) => encodeURIComponent(
    CryptoJS.AES.encrypt(
        url,
        process.env.GLOBAL_KEY
    ).toString()
);

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_APP_HOST,
    port: 465,
    auth: {
        user: process.env.MAIL_APP_EMAIL,
        pass: process.env.MAIL_APP_PASSWORD,
    },
});

const sendMail = async function (toName, toAddress, subject, content) {
    const mailOptions = {
        from: "KoreaAutoPartsLTD <" + process.env.MAIL_APP_EMAIL + ">",
        to: toName + " <" + toAddress + ">",
        replyTo: process.env.MAIL_APP_EMAIL,
        subject: subject,
        html: content
    };

    await transporter.sendMail(mailOptions);
};

const formatBookingEmail = function (context) {
    const filePath = emailsTemplateFolder + "template.jade"

    let file = fs.readFileSync(filePath, 'utf8');

    const compiledTmpl = _jade.compile(file, {filename: filePath});

    return compiledTmpl(context);
}

const formatContext = function (booking, commit, action_btn) {
    return {
        full_name: booking.names,
        commit,
        car_info: {
            chassis_number: booking.car_on_market.supplied_car.chassis_number,
            image_url: booking.car_on_market.supplied_car.car_photo_url,
            company: booking.car_on_market.supplied_car.model.company.name,
            model: booking.car_on_market.supplied_car.model.name,
            year: booking.car_on_market.supplied_car.release_year,
            view_url: "https://koreaautop.com/cars/car/" + encryptedUrl(booking.car_on_market._id)
        },
        action_btn
    }
}

module.exports.sendBookingApprovedMail = async function (order, booking) {
    let context = formatContext(booking, "successfully booked ", {
        description: "Please remember to comply with the deadline of payment :  " + order.payment_deadline + " from today",
        text: 'CONTINUE WITH PAYMENT',
        url: 'https://koreaautop.com/customer/order/payment/' + encryptedUrl(order._id)
    });

    await sendMail(booking.names, booking.email, "The Booking You recently requested is now Approved", formatBookingEmail(context))
}

module.exports.sendBookingRejectedMail = async function (booking) {
    let context = formatContext(booking, "rejected", {
        description: 'You can look for other cars from our online store',
        text: 'LOOK FOR OTHER CARS',
        url: 'https://koreaautop.com/cars'
    });
    await sendMail(booking.customer.user.fullNames, booking.customer.user.email, "Sorry the booking You recently requested was rejected", formatBookingEmail(context))
}


module.exports.sendBookingCancelledMail = async function (order) {
    let context = formatContext(order.booking, "cancelled", {
        description: 'You can rebook if you still have the plan.',
        text: 'VIEW OTHER CARS',
        url: 'https://koreaautop.com/cars'
    });
    
    await sendMail(order.booking.names, order.booking.email, "Your order was Cancelled", formatBookingEmail(context))
}

module.exports.sendEmailForValidPayment = async function (car_order) {
    let context = formatContext(car_order.booking, "successfully paid", {
        description: 'You can book other cars.',
        text: 'VIEW OTHER CARS',
        url: 'https://koreaautop.com/cars'
    });
    
    await sendMail(order.booking.names, order.booking.email, "Your order was Successfully paid", formatBookingEmail(context))
}

module.exports.sendEmailForInvalidPayment = async function (car_order) {
    let context = formatContext(car_order.booking, "Unsuccessfully paid", {
        description: 'You can book other cars.',
        text: 'VIEW OTHER CARS',
        url: 'https://koreaautop.com/cars'
    });
    
    
    await sendMail(order.booking.names, order.booking.email, "Your order was Unsuccessfully paid", formatBookingEmail(context))
}

module.exports.sendEmailForBookingMovesToShippingState = async function (booking) {
    let context = formatContext(booking, "moved to shipping state", {
        description: 'You can book other cars.',
        text: 'VIEW OTHER CARS',
        url: 'https://koreaautop.com/cars'
    });
    
    
    await sendMail(order.booking.names, order.booking.email, "Your order moved to shipping state", formatBookingEmail(context))
}

module.exports.sendEmailForBookingMovesToProccessingState = async function (booking) {
    let context = formatContext(booking, "moved to proccessing state", {
        description: 'You can book other cars.',
        text: 'VIEW OTHER CARS',
        url: 'https://koreaautop.com/cars'
    });
    
    
    await sendMail(order.booking.names, order.booking.email, "Your booking moved to proccessing state", formatBookingEmail(context))
}

module.exports.sendTestingEmail = async function (to) {
    
    const mailOptions = {
        from: "KoreaAutoPartsLTD <" + process.env.MAIL_APP_EMAIL + ">",
        to: "Testing User" + " <" + to + ">",
        replyTo: process.env.MAIL_APP_EMAIL,
        subject: "No subject",
        html: "<div>Hello this is anselme</div>"
    };
    
    await transporter.sendMail(mailOptions);
}

module.exports.send = async function send() {
    await sendMail("IRUMVA Anselme", "andesanselme@gmail.com", 'test', formatBookingEmail(null))
}

module.exports.preview = async function (res) {
    let context = {
        full_name: "DUSHIMIMANA Samuel",
        commit: 'dsdsds',
        car_info: {
            chassis_number: "234567890",
            image_url: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/2019-honda-civic-sedan-1558453497.jpg?crop=1xw:0.9997727789138833xh;center,top&resize=480:*",
            company: "Toyota",
            model: "Hillux",
            year: "2012",
            view_url: "https://stackoverflow.com/questions/21654051/how-to-send-an-html-page-as-email-in-nodejs"
        },
        action_btn: {
            description: 'A cool description',
            text: 'My bookings',
            url: 'https://bookings'
        }
    }

    const html = formatBookingEmail(context);
    return res.send(html)
}