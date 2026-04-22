const Reserva = require('../models/Reserva');
const DetalleReservaPaquete = require('../models/DetalleReservaPaquete');
const DetalleReservaServicio = require('../models/DetalleReservaServicio');

const listReservas = async () => await Reserva.getAll();
const getReserva = async (id) => await Reserva.getById(id);

const addReserva = async (data) => {
  // 1. Crear Reserva Padre
  const reservaId = await Reserva.create(data);
  
  // 2. Insertar Paquetes si existen
  if (data.detallesPaquetes && data.detallesPaquetes.length > 0) {
    for (const paquete of data.detallesPaquetes) {
      await DetalleReservaPaquete.create({
        IDReserva: reservaId,
        Cantidad: paquete.cantidad || 1,
        Precio: paquete.precio,
        Estado: 1, // Por defecto
        IDPaquete: paquete.idpaquete
      });
    }
  }

  // 3. Insertar Servicios si existen
  if (data.detallesServicios && data.detallesServicios.length > 0) {
    for (const serv of data.detallesServicios) {
      await DetalleReservaServicio.create({
        IDReserva: reservaId,
        Cantidad: serv.cantidad || 1,
        Precio: serv.precio,
        Estado: 1, // Por defecto
        IDServicio: serv.idservicio
      });
    }
  }

  return reservaId;
};

const updateReserva = async (id, data) => await Reserva.update(id, data);
const deleteReserva = async (id) => await Reserva.delete(id);

module.exports = { listReservas, getReserva, addReserva, updateReserva, deleteReserva };
