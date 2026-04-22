const db = require('../config/db');

const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Ingresos Mensuales (Últimos 6 meses)
    // Usamos DATE_FORMAT para agrupar por mes
    const [revenueData] = await db.execute(`
      SELECT 
        DATE_FORMAT(FechaReserva, '%b') as name, 
        SUM(MontoTotal) as ingresos,
        COUNT(IdReserva) as reservas
      FROM reserva 
      WHERE FechaReserva >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(FechaReserva, '%Y-%m'), name
      ORDER BY DATE_FORMAT(FechaReserva, '%Y-%m') ASC
    `);

    // 2. Distribución por Estado de Reserva
    const [statusData] = await db.execute(`
      SELECT 
        er.NombreEstadoReserva as name, 
        COUNT(r.IdReserva) as value 
      FROM reserva r 
      JOIN estadosreserva er ON r.IdEstadoReserva = er.IdEstadoReserva 
      GROUP BY er.NombreEstadoReserva
    `);

    // 3. Paquetes más vendidos
    const [packageData] = await db.execute(`
      SELECT 
        p.NombrePaquete as name, 
        COUNT(drp.IDDetalleReservaPaquetes) as value 
      FROM detallereservapaquetes drp 
      JOIN paquetes p ON drp.IDPaquete = p.IDPaquete 
      GROUP BY p.NombrePaquete 
      ORDER BY value DESC 
      LIMIT 5
    `);

    res.json({
      revenue: revenueData,
      statuses: statusData,
      packages: packageData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
