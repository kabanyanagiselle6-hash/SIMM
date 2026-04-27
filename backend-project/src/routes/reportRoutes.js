import { Router } from 'express'
import {
  getDailyStockOutReport,
  getDailyStockStatus,
} from '../controllers/reportController.js'

const router = Router()

router.get('/daily-stock-status', getDailyStockStatus)
router.get('/daily-stock-out', getDailyStockOutReport)

export default router
