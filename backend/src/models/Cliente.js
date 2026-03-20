const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM clientes');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM clientes WHERE NroDocumento = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { NroDocumento, Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol } = data;

  const fields = ['NroDocumento', 'Nombre', 'Apellido', 'Direccion', 'Email', 'Telefono', 'Estado'];
  const values = [NroDocumento, Nombre, Apellido, Direccion, Email, Telefono, Estado !== undefined ? Estado : 1];

  if (IDRol !== undefined && IDRol !== null) {
    fields.push('IDRol');
    values.push(IDRol);
  }

  const placeholders = fields.map(() => '?').join(', ');
  const [result] = await db.execute(
    `INSERT INTO clientes (${fields.join(', ')}) VALUES (${placeholders})`,
    values
  );
  
  // result.insertId returns the auto_increment value (IDCliente)
  return { NroDocumento, IDCliente: result.insertId };
};

const update = async (id, data) => {
  const { Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol } = data;

  const setFields = ['Nombre = ?', 'Apellido = ?', 'Direccion = ?', 'Email = ?', 'Telefono = ?', 'Estado = ?'];
  const values = [Nombre, Apellido, Direccion, Email, Telefono, Estado];

  if (IDRol !== undefined && IDRol !== null) {
    setFields.push('IDRol = ?');
    values.push(IDRol);
  }

  values.push(id);
  const [result] = await db.execute(
    `UPDATE clientes SET ${setFields.join(', ')} WHERE NroDocumento = ?`,
    values
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM clientes WHERE NroDocumento = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: remove
};
