const db = require('../config/db');

const getAll = async () => {
  const [rows] = await db.execute(`
    SELECT r.*, e.NombreEstadoReserva, m.NomMetodoPago
    FROM reserva r
    LEFT JOIN estadosreserva e ON r.IdEstadoReserva = e.IdEstadoReserva
    LEFT JOIN metodopago m ON r.MetodoPago = m.IdMetodoPago
    ORDER BY r.FechaReserva DESC
  `);
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM Reserva WHERE IdReserva = ?', [id]);
  return rows[0];
};

const getByUser = async (idUsuario) => {
  const [rows] = await db.execute(`
    SELECT 
      r.*,
      e.NombreEstadoReserva,
      m.NomMetodoPago
    FROM Reserva r
    LEFT JOIN estadosreserva e ON r.IdEstadoReserva = e.IdEstadoReserva
    LEFT JOIN metodopago m ON r.MetodoPago = m.IdMetodoPago
    WHERE r.UsuarioIdusuario = ?
    ORDER BY r.FechaReserva DESC
  `, [idUsuario]);
  return rows;
};

const getPaquetesByReserva = async (idReserva) => {
  const [rows] = await db.execute(`
    SELECT dp.*, p.NombrePaquete, p.Precio as PrecioUnitario
    FROM detallereservapaquetes dp
    JOIN paquetes p ON dp.IDPaquete = p.IDPaquete
    WHERE dp.IDReserva = ?
  `, [idReserva]);
  return rows;
};

const getServiciosByReserva = async (idReserva) => {
  const [rows] = await db.execute(`
    SELECT ds.*, s.NombreServicio, s.Costo as PrecioUnitario
    FROM detallereservaservicio ds
    JOIN servicios s ON ds.IDServicio = s.IDServicio
    WHERE ds.IDReserva = ?
  `, [idReserva]);
  return rows;
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

module.exports = { getAll, getById, getByUser, getPaquetesByReserva, getServiciosByReserva, create, update, delete: remove };
