import jwt from 'jsonwebtoken'
import authConfig from '../../config/authConfig'

export default (request, response, next) => {
  const checkToken = request.headers.authorization

  if (!checkToken) {
    return response.status(401).json({ Error: 'Token not provide' })
  }

  const token = checkToken.split(' ')[1]

  try {
    jwt.verify(token, authConfig.secret, function (err, decoded) {
      if (err) {
        throw new Error()
      }

      request.userId = decoded.id
      request.userName = decoded.name

      return next()
    })
  } catch (err) {
    return response.status(401).json({ Error: 'Token ivalid ' + err })
  }
}
