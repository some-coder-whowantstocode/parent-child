'use server';
import nodemailer from 'nodemailer';


let transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.SERVER_MAIL,
        pass: process.env.SERVER_MAIL_PASS,
    }
});


async function handleEmailVerification(sub: string, text: string, email:string, htmlContent:string){
    try {
    let mailOptions = {
        from:  process.env.SERVER_MAIL,
        to: email,
        subject: sub,
        html:htmlContent
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    console.log('Email sent: ' + info.response);
    });
    
    } catch (error) {
        console.log('something went wrong while sending mail');
        throw error;
    }
}

export default handleEmailVerification;