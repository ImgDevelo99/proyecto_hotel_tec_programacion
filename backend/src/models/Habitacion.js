const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM Habitacion');
  return rows.map(r => ({
    ...r,
    ImagenHabitacion: r.ImagenHabitacion ? r.ImagenHabitacion.toString('utf8') : null
  }));
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM Habitacion WHERE IDHabitacion = ?', [id]);
  if (!rows[0]) return null;
  return {
    ...rows[0],
    ImagenHabitacion: rows[0].ImagenHabitacion ? rows[0].ImagenHabitacion.toString('utf8') : null
  };
};

const create = async (data) => {
  const { NombreHabitacion, Descripcion, Costo, Estado, ImagenHabitacion } = data;
  const [result] = await db.execute(
    'INSERT INTO Habitacion (NombreHabitacion, Descripcion, Costo, Estado, ImagenHabitacion) VALUES (?, ?, ?, ?, ?)',
    [NombreHabitacion, Descripcion, Costo, Estado, ImagenHabitacion || null]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { NombreHabitacion, Descripcion, Costo, Estado, ImagenHabitacion } = data;
  const [result] = await db.execute(
    'UPDATE Habitacion SET NombreHabitacion = ?, Descripcion = ?, Costo = ?, Estado = ?, ImagenHabitacion = ? WHERE IDHabitacion = ?',
    [NombreHabitacion, Descripcion, Costo, Estado, ImagenHabitacion || null, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM Habitacion WHERE IDHabitacion = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: remove
};
