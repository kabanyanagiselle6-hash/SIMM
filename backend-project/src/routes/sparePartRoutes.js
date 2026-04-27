import { Router } from 'express'
import {
  createSparePart,
  getSpareParts,
} from '../controllers/sparePartController.js'

const router = Router()

router.post('/', createSparePart)
router.get('/', getSpareParts)

export default router
