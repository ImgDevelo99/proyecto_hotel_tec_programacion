const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM Usuarios');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM Usuarios WHERE IDUsuario = ?', [id]);
  return rows[0];
};

const getByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM usuarios WHERE Email = ?', [email]);
  return rows[0];
};

const create = async (data) => {
  const { NombreUsuario, Contrasena, Apellido, Email, TipoDocumento = null, NumeroDocumento = null, Telefono = null, Pais = null, Direccion = null, IDRol } = data;
  const [result] = await db.execute(
    'INSERT INTO usuarios (NombreUsuario, Contrasena, Apellido, Email, TipoDocumento, NumeroDocumento, Telefono, Pais, Direccion, IDRol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [NombreUsuario, Contrasena, Apellido, Email, TipoDocumento, NumeroDocumento, Telefono, Pais, Direccion, IDRol]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { NombreUsuario, Contrasena, Apellido, Email, TipoDocumento, NumeroDocumento, Telefono, Pais, Direccion, IDRol } = data;
  const [result] = await db.execute(
    'UPDATE Usuarios SET NombreUsuario = ?, Contrasena = ?, Apellido = ?, Email = ?, TipoDocumento = ?, NumeroDocumento = ?, Telefono = ?, Pais = ?, Direccion = ?, IDRol = ? WHERE IDUsuario = ?',
    [NombreUsuario, Contrasena, Apellido, Email, TipoDocumento, NumeroDocumento, Telefono, Pais, Direccion, IDRol, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM Usuarios WHERE IDUsuario = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, getByEmail, create, update, delete: remove };
//Correo Electrónico: superadmin@hotelsys.com
//Contraseña: SuperAdmin2026!
