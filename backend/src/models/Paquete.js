const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM Paquetes');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM Paquetes WHERE IDPaquete = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { NombrePaquete, Descripcion, IDHabitacion, IDServicio, Precio, Estado } = data;
  const [result] = await db.execute(
    'INSERT INTO Paquetes (NombrePaquete, Descripcion, IDHabitacion, IDServicio, Precio, Estado) VALUES (?, ?, ?, ?, ?, ?)',
    [NombrePaquete, Descripcion, IDHabitacion, IDServicio, Precio, Estado]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { NombrePaquete, Descripcion, IDHabitacion, IDServicio, Precio, Estado } = data;
  const [result] = await db.execute(
    'UPDATE Paquetes SET NombrePaquete = ?, Descripcion = ?, IDHabitacion = ?, IDServicio = ?, Precio = ?, Estado = ? WHERE IDPaquete = ?',
    [NombrePaquete, Descripcion, IDHabitacion, IDServicio, Precio, Estado, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM Paquetes WHERE IDPaquete = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove };
