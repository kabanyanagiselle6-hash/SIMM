import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import { signToken } from '../utils/token.js'

export async function register(request, response) {
  try {
    const { username, password } = request.body

    if (!username || !password) {
      return response
        .status(400)
        .json({ message: 'Username and password are required.' })
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username],
    )

    if (existingUsers.length > 0) {
      return response.status(409).json({ message: 'Username already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
    )

    const user = { id: result.insertId, username }
    const token = signToken(user)

    response.status(201).json({ token, user })
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}

export async function login(request, response) {
  try {
    const { username, password } = request.body
    const [users] = await pool.query(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username],
    )

    if (users.length === 0) {
      return response.status(401).json({ message: 'Invalid credentials.' })
    }

    const user = users[0]
    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      return response.status(401).json({ message: 'Invalid credentials.' })
    }

    const payload = { id: user.id, username: user.username }
    const token = signToken(payload)

    response.json({ token, user: payload })
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}
