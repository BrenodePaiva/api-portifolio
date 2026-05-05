import { MailtrapClient } from 'mailtrap'
import 'dotenv/config'

const sendEmail = async options => {
  const client = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN })

  await client
    .send({
      from: {
        email: 'no-reply@code-burger.brenofullstack.com',
        name: options.name
      },
      to: [{ email: options.to }],
      subject: options.subject,
      html: options.htmlmail,
      category: options.category
    })
    .then(console.log, console.error)
}

export default sendEmail
