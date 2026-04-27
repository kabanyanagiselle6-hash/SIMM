import jwt from 'jsonwebtoken'

function authMiddleware(request, response, next) {
  const header = request.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Unauthorized access.' })
  }

  const token = header.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    request.user = decoded
    next()
  } catch {
    response.status(401).json({ message: 'Invalid or expired token.' })
  }
}

export default authMiddleware
