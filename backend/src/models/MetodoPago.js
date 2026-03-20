const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM MetodoPago');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM MetodoPago WHERE IdMetodoPago = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { NomMetodoPago } = data;
  const [result] = await db.execute(
    'INSERT INTO MetodoPago (NomMetodoPago) VALUES (?)',
    [NomMetodoPago]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { NomMetodoPago } = data;
  const [result] = await db.execute(
    'UPDATE MetodoPago SET NomMetodoPago = ? WHERE IdMetodoPago = ?',
    [NomMetodoPago, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM MetodoPago WHERE IdMetodoPago = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove };
