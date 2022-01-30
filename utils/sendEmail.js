const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'gamenodeonline911@gmail.com',
                pass: 'Game@dmin',
            },
        });

        await transporter.sendMail({
            from: 'gamenodeonline911@gmail.com',
            to: email,
            subject: subject,
            html: '<p>You requested a reset password! kindly use this <a href="https://gamenode.online/reset-password?token=' + token + '">link</a> to reset your password</p>'
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;