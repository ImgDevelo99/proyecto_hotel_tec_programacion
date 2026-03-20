const db = require('./src/config/db');
async function test() {
  const [rows] = await db.execute('DESCRIBE clientes');
  for (let i = 0; i < 6; i++) {
    if (rows[i]) console.log(`${i}: ${rows[i].Field} (${rows[i].Type})`);
  }
  process.exit(0);
}
test();
