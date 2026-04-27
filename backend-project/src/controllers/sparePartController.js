import pool from '../config/db.js'

export async function createSparePart(request, response) {
  try {
    const { spareName, category, unit, minimumQuantity } = request.body
    const [result] = await pool.query(
      `INSERT INTO spare_parts (spare_name, category, unit, minimum_quantity)
       VALUES (?, ?, ?, ?)`,
      [spareName, category, unit, minimumQuantity],
    )

    response.status(201).json({
      id: result.insertId,
      message: 'Spare part inserted successfully.',
    })
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}

export async function getSpareParts(_request, response) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM spare_parts ORDER BY spare_name ASC',
    )
    response.json(rows)
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}
