const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Hotel System API' });
});

// Routes — Existing
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/habitaciones', require('./routes/habitacionRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));

// Routes — Catalog Tables
app.use('/api/roles', require('./routes/rolRoutes'));
app.use('/api/permisos', require('./routes/permisoRoutes'));
app.use('/api/roles-permisos', require('./routes/rolPermisoRoutes'));
app.use('/api/estados-reserva', require('./routes/estadoReservaRoutes'));
app.use('/api/metodos-pago', require('./routes/metodoPagoRoutes'));
app.use('/api/servicios', require('./routes/servicioRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));

// Routes — FK-Dependent Tables
app.use('/api/paquetes', require('./routes/paqueteRoutes'));
app.use('/api/reservas', require('./routes/reservaRoutes'));
app.use('/api/detalle-reserva-paquetes', require('./routes/detalleReservaPaqueteRoutes'));
app.use('/api/detalle-reserva-servicio', require('./routes/detalleReservaServicioRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/portal', require('./routes/portalRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));

// Error handling middleware (to be implemented)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
