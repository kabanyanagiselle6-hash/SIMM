import express from 'express'
import cors from 'cors'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import sparePartRoutes from './routes/sparePartRoutes.js'
import stockInRoutes from './routes/stockInRoutes.js'
import stockOutRoutes from './routes/stockOutRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import authMiddleware from './middleware/auth.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({
      message: 'SIMS backend is running.',
      database: 'connected',
    })
  } catch (error) {
    response.status(500).json({
      message: 'SIMS backend is running, but database connection failed.',
      database: 'disconnected',
      error: error.message || String(error),
      code: error.code || null,
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/spare-parts', authMiddleware, sparePartRoutes)
app.use('/api/stock-in', authMiddleware, stockInRoutes)
app.use('/api/stock-out', authMiddleware, stockOutRoutes)
app.use('/api/reports', authMiddleware, reportRoutes)

export default app
