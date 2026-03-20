const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM DetalleReservaPaquetes');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM DetalleReservaPaquetes WHERE IDDetalleReservaPaquetes = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { IDReserva, Cantidad, Precio, Estado, IDPaquete } = data;
  const [result] = await db.execute(
    'INSERT INTO DetalleReservaPaquetes (IDReserva, Cantidad, Precio, Estado, IDPaquete) VALUES (?, ?, ?, ?, ?)',
    [IDReserva, Cantidad, Precio, Estado, IDPaquete]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { IDReserva, Cantidad, Precio, Estado, IDPaquete } = data;
  const [result] = await db.execute(
    'UPDATE DetalleReservaPaquetes SET IDReserva = ?, Cantidad = ?, Precio = ?, Estado = ?, IDPaquete = ? WHERE IDDetalleReservaPaquetes = ?',
    [IDReserva, Cantidad, Precio, Estado, IDPaquete, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM DetalleReservaPaquetes WHERE IDDetalleReservaPaquetes = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove };
