const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM RolesPermisos');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM RolesPermisos WHERE IDRolPermiso = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { IDRol, IDPermiso } = data;
  const [result] = await db.execute(
    'INSERT INTO RolesPermisos (IDRol, IDPermiso) VALUES (?, ?)',
    [IDRol, IDPermiso]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { IDRol, IDPermiso } = data;
  const [result] = await db.execute(
    'UPDATE RolesPermisos SET IDRol = ?, IDPermiso = ? WHERE IDRolPermiso = ?',
    [IDRol, IDPermiso, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM RolesPermisos WHERE IDRolPermiso = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove };
