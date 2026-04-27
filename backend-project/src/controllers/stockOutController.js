import pool from '../config/db.js'

async function validateRemainingStock(sparePartId, quantity, excludeId = null) {
  const [stockInRows] = await pool.query(
    'SELECT COALESCE(SUM(quantity), 0) AS total_in FROM stock_in WHERE spare_part_id = ?',
    [sparePartId],
  )
  const [stockOutRows] = await pool.query(
    `SELECT COALESCE(SUM(quantity), 0) AS total_out
     FROM stock_out
     WHERE spare_part_id = ?
     ${excludeId ? 'AND id <> ?' : ''}`,
    excludeId ? [sparePartId, excludeId] : [sparePartId],
  )

  const totalIn = Number(stockInRows[0].total_in)
  const totalOut = Number(stockOutRows[0].total_out)
  const remaining = totalIn - totalOut

  return remaining >= Number(quantity)
}

export async function createStockOut(request, response) {
  try {
    const { sparePartId, quantity, destination } = request.body
    const hasStock = await validateRemainingStock(sparePartId, quantity)

    if (!hasStock) {
      return response
        .status(400)
        .json({ message: 'Insufficient stored quantity for stock-out.' })
    }

    const [result] = await pool.query(
      `INSERT INTO stock_out (spare_part_id, quantity, destination)
       VALUES (?, ?, ?)`,
      [sparePartId, quantity, destination],
    )

    response.status(201).json({
      id: result.insertId,
      message: 'Stock-out inserted successfully.',
    })
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}

export async function getStockOutEntries(_request, response) {
  try {
    const [rows] = await pool.query(
      `SELECT so.*, sp.spare_name
       FROM stock_out so
       JOIN spare_parts sp ON sp.id = so.spare_part_id
       ORDER BY so.stock_out_date DESC`,
    )
    response.json(rows)
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}

export async function updateStockOut(request, response) {
  try {
    const { id } = request.params
    const { sparePartId, quantity, destination } = request.body
    const hasStock = await validateRemainingStock(sparePartId, quantity, id)

    if (!hasStock) {
      return response
        .status(400)
        .json({ message: 'Insufficient stored quantity for this update.' })
    }

    await pool.query(
      `UPDATE stock_out
       SET spare_part_id = ?, quantity = ?, destination = ?
       WHERE id = ?`,
      [sparePartId, quantity, destination, id],
    )

    response.json({ message: 'Stock-out updated successfully.' })
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}

export async function deleteStockOut(request, response) {
  try {
    const { id } = request.params
    await pool.query('DELETE FROM stock_out WHERE id = ?', [id])
    response.json({ message: 'Stock-out deleted successfully.' })
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}
