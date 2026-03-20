const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM Servicios');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM Servicios WHERE IDServicio = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado } = data;
  const [result] = await db.execute(
    'INSERT INTO Servicios (NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado) VALUES (?, ?, ?, ?, ?, ?)',
    [NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado } = data;
  const [result] = await db.execute(
    'UPDATE Servicios SET NombreServicio = ?, Descripcion = ?, Duracion = ?, CantidadMaximaPersonas = ?, Costo = ?, Estado = ? WHERE IDServicio = ?',
    [NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM Servicios WHERE IDServicio = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove };
