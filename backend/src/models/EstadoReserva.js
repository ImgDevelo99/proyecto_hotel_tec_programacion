const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM EstadosReserva');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM EstadosReserva WHERE IdEstadoReserva = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { NombreEstadoReserva } = data;
  const [result] = await db.execute(
    'INSERT INTO EstadosReserva (NombreEstadoReserva) VALUES (?)',
    [NombreEstadoReserva]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { NombreEstadoReserva } = data;
  const [result] = await db.execute(
    'UPDATE EstadosReserva SET NombreEstadoReserva = ? WHERE IdEstadoReserva = ?',
    [NombreEstadoReserva, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM EstadosReserva WHERE IdEstadoReserva = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove };
