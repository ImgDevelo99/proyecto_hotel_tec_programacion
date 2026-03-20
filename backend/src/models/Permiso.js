const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM Permisos');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM Permisos WHERE IDPermiso = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { NombrePermisos, EstadoPermisos, Descripcion, IsActive } = data;
  const [result] = await db.execute(
    'INSERT INTO Permisos (NombrePermisos, EstadoPermisos, Descripcion, IsActive) VALUES (?, ?, ?, ?)',
    [NombrePermisos, EstadoPermisos, Descripcion, IsActive !== undefined ? IsActive : true]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { NombrePermisos, EstadoPermisos, Descripcion, IsActive } = data;
  const [result] = await db.execute(
    'UPDATE Permisos SET NombrePermisos = ?, EstadoPermisos = ?, Descripcion = ?, IsActive = ? WHERE IDPermiso = ?',
    [NombrePermisos, EstadoPermisos, Descripcion, IsActive, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM Permisos WHERE IDPermiso = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove };
