import pool from '../config/db.js'

export async function createStockIn(request, response) {
  try {
    const { sparePartId, quantity, supplier } = request.body
    const [result] = await pool.query(
      `INSERT INTO stock_in (spare_part_id, quantity, supplier)
       VALUES (?, ?, ?)`,
      [sparePartId, quantity, supplier],
    )

    response.status(201).json({
      id: result.insertId,
      message: 'Stock-in inserted successfully.',
    })
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}
