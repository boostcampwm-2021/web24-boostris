import connection from './connect';

const selectTable = (column, table, condition = null) => {
  let queryLine = `SELECT ${column} FROM ${table} `;
  queryLine += condition ? `WHERE ${condition}` : ``;
  let ans;
  connection.query(queryLine, function (err, results, fields) {
    ans = results;
  });
  return ans;
};
export default selectTable;
