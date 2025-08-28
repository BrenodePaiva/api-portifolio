import * as Yup from 'yup'
import User from '../models/User'
import { v4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import sendEmail from '../../utils/Email'

class UserController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
      password: Yup.string().required().min(6)
    })

    try {
      await schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const { name, email, password } = request.body

    const userExist = await User.findOne({ where: { email } })

    if (userExist) {
      return response.status(400).json({ error: 'User already exist' })
    }

    const user = await User.create({
      id: v4(),
      name,
      email,
      password
    })
    return response.status(201).json({ id: user.id, name, email })
  }

  // -------------------------------------------------------------------------

  async update(request, response) {
    const schema = Yup.object().shape({
      currentpass: Yup.string()
        .required('current password is required')
        .min(6, 'the current password must have at least 6 characters long'),
      password: Yup.string()
        .required('password is required')
        .min(6, 'the password must have at least 6 characters long '),
      confirmPass: Yup.string()
        .required('confirm password is required')
        .oneOf([Yup.ref('password')], 'Password do not macth')
    })

    try {
      await schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ Error: err })
    }

    const { id } = request.params
    const user = await User.findByPk(id)
    const { password, currentpass } = request.body

    if (!user.checkPassword(currentpass)) {
      return response.status(401).json({ message: 'Password are incorrect' })
    }

    try {
      user.password = password
      await user.save()
    } catch (error) {
      return response.status(500).json(error)
    }
  }

  // -------------------------------------------------------------------------

  async contact(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
      subject: Yup.string().required(),
      message: Yup.string().required()
    })

    try {
      await schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ Error: err })
    }

    const { name, email, subject, message } = request.body
    let htmlmail

    htmlmail = fs.readFileSync(
      path.join(__dirname, '..', '..', 'utils', 'mailcontact.html'),
      'utf8'
    )

    const replacements = {
      '[name]': name,
      '[email]': email,
      '[message]': message
    }

    Object.entries(replacements).forEach(([key, value]) => {
      htmlmail = htmlmail.replaceAll(key, value)
    })

    try {
      await sendEmail({
        subject,
        to: 'brenopaiva552@gmail.com',
        htmlmail,
        category: 'Contact form'
      })
    } catch (err) {
      return response
        .status(500)
        .json({ Error: 'There is a error sending e-mail. ' + err })
    }

    return response.status(200).json({ Message: 'E-mail sended' })
  }
}

export default new UserController()
