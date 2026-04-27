import pool from '../config/db.js'

export async function getDailyStockStatus(request, response) {
  try {
    const reportDate = request.query.date
    const [rows] = await pool.query(
      `SELECT
          sp.id,
          sp.spare_name,
          COALESCE((
            SELECT SUM(si.quantity)
            FROM stock_in si
            WHERE si.spare_part_id = sp.id
          ), 0) AS stored_quantity,
          COALESCE((
            SELECT SUM(so.quantity)
            FROM stock_out so
            WHERE so.spare_part_id = sp.id
              AND DATE(so.stock_out_date) = ?
          ), 0) AS stock_out_quantity,
          COALESCE((
            SELECT SUM(si.quantity)
            FROM stock_in si
            WHERE si.spare_part_id = sp.id
          ), 0) - COALESCE((
            SELECT SUM(so.quantity)
            FROM stock_out so
            WHERE so.spare_part_id = sp.id
              AND DATE(so.stock_out_date) = ?
          ), 0) AS remaining_quantity
       FROM spare_parts sp
       ORDER BY sp.spare_name ASC`,
      [reportDate, reportDate],
    )

    response.json(rows)
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}

export async function getDailyStockOutReport(request, response) {
  try {
    const reportDate = request.query.date
    const [rows] = await pool.query(
      `SELECT so.*, sp.spare_name
       FROM stock_out so
       JOIN spare_parts sp ON sp.id = so.spare_part_id
       WHERE DATE(so.stock_out_date) = ?
       ORDER BY so.stock_out_date DESC`,
      [reportDate],
    )

    response.json(rows)
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
}
