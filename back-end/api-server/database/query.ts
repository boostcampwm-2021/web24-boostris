import pool from './connect';

const connectionQuery = async (queryLine) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const [rows] = await connection.query(queryLine);
  connection.release(); // 커넥션 반환
  return rows;
};

export const selectTable = async (column, table, condition = null) => {
  let queryLine = `SELECT ${column} FROM ${table} `;
  queryLine += condition ? `WHERE ${condition}` : ``;
  return connectionQuery(queryLine);
};

export const insertIntoTable = async (table, into, values) => {
  let queryLine = `INSERT INTO ${table} ${into} VALUES (${values})`;
  return connectionQuery(queryLine);
};
