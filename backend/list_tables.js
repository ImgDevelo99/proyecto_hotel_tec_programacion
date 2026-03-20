const db = require('./src/config/db');
async function test() {
  const [rows] = await db.execute('SHOW TABLES');
  rows.forEach(r => console.log(Object.values(r)[0]));
  process.exit(0);
}
test();
