import jwt from 'jsonwebtoken'
import * as Yup from 'yup'
import User from '../models/User'
import authConfig from '../../config/authConfig'
import sendEmail from '../../utils/Email'
import crypto from 'crypto'
import { Sequelize } from 'sequelize'
import fs from 'fs'
import path from 'path'
import 'dotenv/config'

class SessionController {
  async store(request, response) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required()
    })

    const userIncorrect = () => {
      response
        .status(401)
        .json({ Error: 'Make sure your password and email are correct' })
    }

    if (!(await schema.isValid(request.body))) return userIncorrect()

    const { email, password } = request.body

    const user = await User.findOne({ where: { email } })

    if (!user) return userIncorrect()

    if (!(await user.checkPassword(password))) return userIncorrect()

    return response.status(200).json({
      id: user.id,
      name: user.name,
      email,
      token: jwt.sign({ id: user.id, name: user.name }, authConfig.secret, {
        expiresIn: authConfig.expiresIn
      })
    })
  }

  //-------------------------------------------------------------------------

  async forgotPass(request, response) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required()
    })

    try {
      await schema.validateSync(request.body)
    } catch (err) {
      return response.status(400).json({ Error: err })
    }

    const email = request.body.email?.trim().toLowerCase()

    let htmlmail

    const user = await User.findOne({ where: { email } })
    if (!user) {
      htmlmail = fs.readFileSync(
        path.join(__dirname, '..', '..', 'utils', 'mailerror.html')
      )

      try {
        await sendEmail({
          subject: 'Reset password',
          to: email,
          htmlmail,
          category: 'Reset password Erro'
        })
      } catch (err) {
        return response
          .status(500)
          .json({ Error: 'There is a error sending e-mail. ' + err })
      }

      return response.status(404).json({ Error: 'E-mail not found' })
    }

    const resetToken = user.createResetPasswordToken()
    await user.save({ validate: false })

    const resetUrl = `${process.env.API_CONSUMER}/resetpass/${resetToken}`

    htmlmail = fs.readFileSync(
      path.join(__dirname, '..', '..', 'utils', 'mail.html'),
      'utf8'
    )

    htmlmail = htmlmail.replace('[linkButton]', resetUrl)

    try {
      await sendEmail({
        subject: 'Reset password',
        to: email,
        htmlmail,
        category: 'Reset password'
      })
    } catch (err) {
      ;(user.pass_reset_token = null), (user.pass_reset_token_expires = null)
      user.save({ validate: false })

      return response
        .status(500)
        .json({ Error: 'There is a error sending e-mail. ' + err })
    }

    return response.status(200).json({ message: 'password reset link send' })
  }

  //----------------------------------------------------------------------------

  async resetPassword(request, response) {
    const token = crypto
      .createHash('sha256')
      .update(request.params.token)
      .digest('hex')

    const date = Date.now()
    const user = await User.findOne({
      where: {
        pass_reset_token: token,
        pass_reset_token_expires: {
          [Sequelize.Op.gt]: new Date(date) // Converte para um objeto Date
        }
      }
    })

    if (!user) {
      return response.status(400).json({
        Error: `Token is invalid or has expired!,`
      })
    }

    const schema = Yup.object().shape({
      password: Yup.string().required().min(6)
    })

    try {
      await schema.validateSync(request.body)
    } catch (err) {
      return response.status(400).json({ Error: err })
    }

    const { password } = request.body

    ;(user.password = password), (user.pass_reset_token = null)
    user.pass_reset_token_expires = null
    user.save()

    return response.status(200).json({ message: 'The password has changed' })
  }
}

export default new SessionController()
