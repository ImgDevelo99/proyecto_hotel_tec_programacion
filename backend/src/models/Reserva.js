const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute('SELECT * FROM Reserva');
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM Reserva WHERE IdReserva = ?', [id]);
  return rows[0];
};

const create = async (data) => {
  const { NroDocumentoCliente, FechaReserva, FechaInicio, FechaFinalizacion, SubTotal, Descuento, IVA, MontoTotal, MetodoPago, IdEstadoReserva, UsuarioIdusuario } = data;
  const [result] = await db.execute(
    'INSERT INTO Reserva (NroDocumentoCliente, FechaReserva, FechaInicio, FechaFinalizacion, SubTotal, Descuento, IVA, MontoTotal, MetodoPago, IdEstadoReserva, UsuarioIdusuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [NroDocumentoCliente, FechaReserva || new Date(), FechaInicio, FechaFinalizacion, SubTotal, Descuento, IVA, MontoTotal, MetodoPago, IdEstadoReserva, UsuarioIdusuario]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { NroDocumentoCliente, FechaReserva, FechaInicio, FechaFinalizacion, SubTotal, Descuento, IVA, MontoTotal, MetodoPago, IdEstadoReserva, UsuarioIdusuario } = data;
  const [result] = await db.execute(
    'UPDATE Reserva SET NroDocumentoCliente = ?, FechaReserva = ?, FechaInicio = ?, FechaFinalizacion = ?, SubTotal = ?, Descuento = ?, IVA = ?, MontoTotal = ?, MetodoPago = ?, IdEstadoReserva = ?, UsuarioIdusuario = ? WHERE IdReserva = ?',
    [NroDocumentoCliente, FechaReserva, FechaInicio, FechaFinalizacion, SubTotal, Descuento, IVA, MontoTotal, MetodoPago, IdEstadoReserva, UsuarioIdusuario, id]
  );
  return result.affectedRows > 0 ? id : null;
};

const remove = async (id) => {
  const [result] = await db.execute('DELETE FROM Reserva WHERE IdReserva = ?', [id]);
  return result.affectedRows > 0 ? id : null;
};

module.exports = { getAll, getById, create, update, delete: remove };
