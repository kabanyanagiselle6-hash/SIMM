import { Router } from 'express'
import { createStockIn } from '../controllers/stockInController.js'

const router = Router()

router.post('/', createStockIn)

export default router
