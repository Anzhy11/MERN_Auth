const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
require('dotenv').config();


// https://ethereal.email/create
const nodeConfig = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
    }
}

const transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme: "default",
    product: {
        // Appears in header & footer of e-mails
        name: "Mailgen",
        link: 'https://mailgen.js/'
        // Optional product logo
        // logo: 'https://mailgen.js/img/logo.png'
    }
})

/** POST: http://localhost:5050/api/v1/registerMail 
 * @param: {
  "username" : "test123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/
const registerMail = ({ OTP, registerToken, username, email }) => {
    // const { username, userEmail, text, subject } = req.body;
    // const verification = req.user
    console.log('triggerd');

    if (registerToken) {
        // body of the email
        var email = {
            body: {
                name: username,
                intro: 'Welcome to Mailgen! We\'re very excited to have you on board.',
                action: {
                    instructions: 'Please click here to verify your account:',
                    button: {
                        color: '#22BC66', // Optional action button color
                        text: 'Confirm your account',
                        link: `http://localhost:5050/apv/v1/user/${registerToken}`
                    }
                },
                outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
            }
        }
    } else {
        // body of the email
        var email = {
            body: {
                name: username,
                intro: 'Welcome to Mailgen! We\'re very excited to have you on board.',
                action: {
                    instructions: `Enter this otp to reset your password ${OTP}`
                },
                outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
            }
        }
    }



    var emailBody = MailGenerator.generate(email);

    let message = {
        from: process.env.EMAIL,
        to: email,
        subject: "Signup Successful",
        html: emailBody
    }

    // send mail
    transporter.sendMail(message)
        .then(() => {
            return res.status(200).send({ msg: "You should receive an email from us." })
        })
        .catch(error => res.status(500).send({ error }))

}

module.exports = registerMail;