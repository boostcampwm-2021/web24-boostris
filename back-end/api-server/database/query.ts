import pool from './connect';

const connectionQuery = async (queryLine) => {
  const connection = await pool.getConnection(async (conn) => conn);
  const [rows] = await connection.query(queryLine);
  connection.release(); // 커넥션 반환
  return rows;
};

export const selectTable = (column, table, condition = null, ...rest) => {
  let queryLine = `SELECT ${column} FROM ${table} `;
  queryLine += condition ? `WHERE ${condition}` : ``;
  rest.map((value) => (queryLine += value));
  return connectionQuery(queryLine);
};

export const insertIntoTable = (table, into, values) => {
  let queryLine = `INSERT INTO ${table} ${into} VALUES (${values})`;
  return connectionQuery(queryLine);
};

export const innerJoinTable = async (column, tableA, tableB, on = null, condition = null) => {
  let queryLine = `SELECT ${column} FROM ${tableA} INNER JOIN ${tableB} ON ${on} `;
  queryLine += condition ? `WHERE ${condition}` : ``;
  return connectionQuery(queryLine);
};

export const updateTable = async (table, set, condition = null) => {
  let queryLine = `UPDATE ${table} SET ${set} `;
  queryLine += condition ? `WHERE ${condition}` : ``;
  return connectionQuery(queryLine);
};

export const deleteTable = async (table, condition) => {
  let queryLine = `DELETE FROM ${table} WHERE ${condition}`;
  return connectionQuery(queryLine);
};
