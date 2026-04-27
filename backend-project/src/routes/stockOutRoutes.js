import { Router } from 'express'
import {
  createStockOut,
  deleteStockOut,
  getStockOutEntries,
  updateStockOut,
} from '../controllers/stockOutController.js'

const router = Router()

router.post('/', createStockOut)
router.get('/', getStockOutEntries)
router.put('/:id', updateStockOut)
router.delete('/:id', deleteStockOut)

export default router
