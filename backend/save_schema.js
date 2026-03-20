const db = require('./src/config/db');
const fs = require('fs');
async function test() {
  const [rows] = await db.execute('DESCRIBE clientes');
  fs.writeFileSync('clientes_schema.json', JSON.stringify(rows, null, 2));
  process.exit(0);
}
test();
