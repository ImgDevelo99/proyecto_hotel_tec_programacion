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

const getByRol = async (idRol) => {
  const [rows] = await db.execute('SELECT IDPermiso FROM RolesPermisos WHERE IDRol = ?', [idRol]);
  return rows.map(r => r.IDPermiso);
};

// Reemplaza TODOS los permisos de un rol en una transacción atómica
const syncPermisos = async (idRol, idPermisos) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM RolesPermisos WHERE IDRol = ?', [idRol]);
    for (const idPermiso of idPermisos) {
      await conn.execute('INSERT INTO RolesPermisos (IDRol, IDPermiso) VALUES (?, ?)', [idRol, idPermiso]);
    }
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM RolesPermisos WHERE IDRolPermiso = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove, getByRol, syncPermisos };
