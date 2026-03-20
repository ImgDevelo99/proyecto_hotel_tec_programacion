const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM Roles');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM Roles WHERE IDRol = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { Nombre, Estado, IsActive } = data;
  const [result] = await db.execute(
    'INSERT INTO Roles (Nombre, Estado, IsActive) VALUES (?, ?, ?)',
    [Nombre, Estado, IsActive !== undefined ? IsActive : true]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { Nombre, Estado, IsActive } = data;
  const [result] = await db.execute(
    'UPDATE Roles SET Nombre = ?, Estado = ?, IsActive = ? WHERE IDRol = ?',
    [Nombre, Estado, IsActive, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM Roles WHERE IDRol = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove };
