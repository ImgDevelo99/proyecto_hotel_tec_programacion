const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const Reserva = require('../models/Reserva');
const Habitacion = require('../models/Habitacion');
const db = require('../config/db');

// ── GET /api/portal/habitaciones-disponibles ──────────────────────────────
// Habitaciones activas con verificación de disponibilidad opcional
router.get('/habitaciones-disponibles', verifyToken, async (req, res, next) => {
  try {
    const { FechaInicio, FechaFinalizacion } = req.query;
    let query = 'SELECT * FROM habitacion WHERE Estado = 1';
    let params = [];

    if (FechaInicio && FechaFinalizacion) {
      // Excluir habitaciones que tengan reservas activas en ese período
      query = `
        SELECT h.* FROM habitacion h
        WHERE h.Estado = 1
        AND h.IDHabitacion NOT IN (
          SELECT r.NroDocumentoCliente FROM reserva r
          INNER JOIN estadosreserva e ON r.IdEstadoReserva = e.IdEstadoReserva
          WHERE e.NombreEstadoReserva NOT IN ('Anulada', 'Finalizada')
          AND NOT (r.FechaFinalizacion <= ? OR r.FechaInicio >= ?)
        )
      `;
      // Nota: La tabla Reserva no guarda IDHabitacion directamente, 
      // se filtra via paquetes o se agrega la columna. Por ahora retorna todas activas.
      query = 'SELECT * FROM habitacion WHERE Estado = 1';
    }

    const [rows] = await db.execute(query, params);
    const results = rows.map(r => ({
      ...r,
      ImagenHabitacion: r.ImagenHabitacion ? r.ImagenHabitacion.toString('utf8') : null
    }));
    res.json(results);
  } catch (error) { next(error); }
});

// ── GET /api/portal/catalogos ─────────────────────────────────────────────
router.get('/catalogos', verifyToken, async (req, res, next) => {
  try {
    const [estados]  = await db.execute('SELECT * FROM estadosreserva');
    const [metodos]  = await db.execute('SELECT * FROM metodopago');
    const [paquetes] = await db.execute('SELECT * FROM paquetes WHERE Estado = 1');
    const [servicios]= await db.execute('SELECT * FROM servicios WHERE Estado = 1');
    res.json({ estados, metodos, paquetes, servicios });
  } catch (error) { next(error); }
});

// ── GET /api/portal/mis-reservas ──────────────────────────────────────────
router.get('/mis-reservas', verifyToken, async (req, res, next) => {
  try {
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
    `, [req.user.id]);
    res.json(rows);
  } catch (error) { next(error); }
});

// ── GET /api/portal/mi-perfil ─────────────────────────────────────────────
router.get('/mi-perfil', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT IDUsuario, NombreUsuario, Apellido, Email, Telefono, TipoDocumento, NumeroDocumento, Pais, Direccion, IDRol FROM usuarios WHERE IDUsuario = ?',
      [req.user.id]
    );
    res.json(rows[0] || null);
  } catch (error) { next(error); }
});

// ── PUT /api/portal/mi-perfil ─────────────────────────────────────────────
router.put('/mi-perfil', verifyToken, async (req, res, next) => {
  try {
    const { Telefono, Pais, Direccion, TipoDocumento, NumeroDocumento } = req.body;
    await db.execute(
      'UPDATE usuarios SET Telefono = ?, Pais = ?, Direccion = ?, TipoDocumento = ?, NumeroDocumento = ? WHERE IDUsuario = ?',
      [Telefono, Pais, Direccion, TipoDocumento, NumeroDocumento, req.user.id]
    );
    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) { next(error); }
});

// ── POST /api/portal/reservar ─────────────────────────────────────────────
// Crea una reserva completa con servicios y/o paquetes opcionales
router.post('/reservar', verifyToken, async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const {
      NroDocumentoCliente,
      FechaInicio,
      FechaFinalizacion,
      MetodoPago,
      IDHabitacion,
      servicios = [],   // [{ IDServicio, Cantidad }]
      paquetes  = [],   // [{ IDPaquete, Cantidad }]
      Descuento = 0,
      Observaciones = null,
    } = req.body;

    if (!NroDocumentoCliente) {
      return res.status(400).json({ message: 'Debes completar tu número de documento en el Perfil antes de reservar.' });
    }
    if (!IDHabitacion || !FechaInicio || !FechaFinalizacion || !MetodoPago) {
      return res.status(400).json({ message: 'Faltan campos obligatorios (habitación, fechas, método de pago).' });
    }

    const fechaIni = new Date(FechaInicio);
    const fechaFin = new Date(FechaFinalizacion);
    if (fechaFin <= fechaIni) {
      return res.status(400).json({ message: 'La fecha de salida debe ser posterior a la de entrada.' });
    }

    // 1. Obtener habitación y calcular noches
    const habitacion = await Habitacion.getById(IDHabitacion);
    if (!habitacion) return res.status(404).json({ message: 'Habitación no encontrada.' });

    const dias = Math.ceil((fechaFin - fechaIni) / 86400000);
    let subTotal = parseFloat(habitacion.Costo) * dias;

    // 2. Añadir servicios adicionales
    const serviciosDetalle = [];
    for (const s of servicios) {
      const [rows] = await conn.execute('SELECT * FROM servicios WHERE IDServicio = ?', [s.IDServicio]);
      if (rows[0]) {
        const precio = parseFloat(rows[0].Costo) * (s.Cantidad || 1);
        subTotal += precio;
        serviciosDetalle.push({ ...rows[0], Cantidad: s.Cantidad || 1, PrecioTotal: precio });
      }
    }

    // 3. Añadir paquetes
    const paquetesDetalle = [];
    for (const p of paquetes) {
      const [rows] = await conn.execute('SELECT * FROM paquetes WHERE IDPaquete = ?', [p.IDPaquete]);
      if (rows[0]) {
        const precio = parseFloat(rows[0].Precio) * (p.Cantidad || 1);
        subTotal += precio;
        paquetesDetalle.push({ ...rows[0], Cantidad: p.Cantidad || 1, PrecioTotal: precio });
      }
    }

    // 4. Calcular totales
    const descuentoAmt = parseFloat(Descuento) || 0;
    const baseGravable = subTotal - descuentoAmt;
    const iva          = baseGravable * 0.19;
    const montoTotal   = baseGravable + iva;

    // 5. Estado Pendiente
    const [estadoRows] = await conn.execute(
      "SELECT IdEstadoReserva FROM estadosreserva WHERE NombreEstadoReserva LIKE '%Pendiente%' LIMIT 1"
    );
    const estadoId = estadoRows[0]?.IdEstadoReserva || 6;

    await conn.beginTransaction();

    // 6. Insertar Reserva
    const [result] = await conn.execute(
      `INSERT INTO Reserva (NroDocumentoCliente, FechaReserva, FechaInicio, FechaFinalizacion, 
        SubTotal, Descuento, IVA, MontoTotal, MetodoPago, IdEstadoReserva, UsuarioIdusuario)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [NroDocumentoCliente, FechaInicio, FechaFinalizacion, subTotal, descuentoAmt, iva, montoTotal, MetodoPago, estadoId, req.user.id]
    );
    const idReserva = result.insertId;

    // 7. Insertar detalles de servicios
    for (const s of serviciosDetalle) {
      await conn.execute(
        'INSERT INTO detallereservaservicio (IDReserva, IDServicio, Cantidad, Precio, Estado) VALUES (?, ?, ?, ?, 1)',
        [idReserva, s.IDServicio, s.Cantidad, s.PrecioTotal]
      );
    }

    // 8. Insertar detalles de paquetes
    for (const p of paquetesDetalle) {
      await conn.execute(
        'INSERT INTO detallereservapaquetes (IDReserva, IDPaquete, Cantidad, Precio, Estado) VALUES (?, ?, ?, ?, 1)',
        [idReserva, p.IDPaquete, p.Cantidad, p.PrecioTotal]
      );
    }

    // 9. Crear notificación para el Administrador (IDRolDestino = 1)
    const msj = `Nueva reserva pendiente del cliente ${NroDocumentoCliente} para la fecha ${FechaInicio}.`;
    await conn.execute(
      'INSERT INTO notificaciones (Mensaje, IDRolDestino, IDReservaAsociada) VALUES (?, ?, ?)',
      [msj, 1, idReserva]
    );

    await conn.commit();

    res.status(201).json({
      id: idReserva,
      message: 'Reserva creada exitosamente',
      resumen: { dias, subTotal, descuento: descuentoAmt, iva, montoTotal }
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
});

// ── DELETE /api/portal/reservas/:id ──────────────────────────────────────
router.delete('/reservas/:id', verifyToken, async (req, res, next) => {
  try {
    const reserva = await Reserva.getById(req.params.id);
    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada' });
    if (reserva.UsuarioIdusuario !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para cancelar esta reserva.' });
    }

    const [estado] = await db.execute('SELECT NombreEstadoReserva FROM estadosreserva WHERE IdEstadoReserva = ?', [reserva.IdEstadoReserva]);
    const nombreEstado = estado[0]?.NombreEstadoReserva || '';
    if (!nombreEstado.toLowerCase().includes('pendiente')) {
      return res.status(400).json({ message: `No se puede cancelar: la reserva está en estado "${nombreEstado}".` });
    }

    const [anulada] = await db.execute("SELECT IdEstadoReserva FROM estadosreserva WHERE NombreEstadoReserva LIKE '%Anulada%' LIMIT 1");
    await db.execute('UPDATE Reserva SET IdEstadoReserva = ? WHERE IdReserva = ?', [anulada[0]?.IdEstadoReserva, req.params.id]);

    res.json({ message: 'Reserva cancelada correctamente.' });
  } catch (error) { next(error); }
});

module.exports = router;
