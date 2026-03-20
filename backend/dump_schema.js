const db = require('./src/config/db');

async function dumpSchema() {
  try {
    const [tables] = await db.execute('SHOW TABLES');
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      console.log(`--- Table: ${tableName} ---`);
      const [columns] = await db.execute(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`  ${col.Field} (${col.Type}) - Null: ${col.Null}, Key: ${col.Key}`);
      });
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

dumpSchema();
