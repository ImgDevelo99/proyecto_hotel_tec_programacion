const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM DetalleReservaServicio');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM DetalleReservaServicio WHERE IDDetalleReservaServicio = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { IDReserva, Cantidad, Precio, Estado, IDServicio } = data;
  const [result] = await db.execute(
    'INSERT INTO DetalleReservaServicio (IDReserva, Cantidad, Precio, Estado, IDServicio) VALUES (?, ?, ?, ?, ?)',
    [IDReserva, Cantidad, Precio, Estado, IDServicio]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { IDReserva, Cantidad, Precio, Estado, IDServicio } = data;
  const [result] = await db.execute(
    'UPDATE DetalleReservaServicio SET IDReserva = ?, Cantidad = ?, Precio = ?, Estado = ?, IDServicio = ? WHERE IDDetalleReservaServicio = ?',
    [IDReserva, Cantidad, Precio, Estado, IDServicio, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM DetalleReservaServicio WHERE IDDetalleReservaServicio = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove };
