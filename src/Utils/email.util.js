import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
    const { EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_USER || !EMAIL_PASS) {
        console.log(`\n[EMAIL not configured - printed here instead]\nTo: ${to}\nSubject: ${subject}\n${text}\n`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: (Number(process.env.EMAIL_PORT) || 465) === 465,
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    await transporter.sendMail({
        from: `"Sarahah App" <${EMAIL_USER}>`,
        to,
        subject,
        text,
    });
};
