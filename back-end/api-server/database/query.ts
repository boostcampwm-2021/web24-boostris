import pool from './connect';

const selectTable = async (column, table, condition = null) => {
  let queryLine = `SELECT ${column} FROM ${table} `;
  queryLine += condition ? `WHERE ${condition}` : ``;
  const connection = await pool.getConnection(async (conn) => conn);
  const [rows] = await connection.query(queryLine);
  connection.release(); // 커넥션 반환
  return rows;
};
export default selectTable;
