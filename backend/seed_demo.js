/**
 * SEED: 10 Habitaciones + 10 Servicios + 10 Paquetes
 * Ejecutar: node seed_demo.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const HABITACIONES = [
  {
    NombreHabitacion: 'Suite Presidencial',
    Descripcion: 'La suite más exclusiva del hotel. Vista panorámica a la ciudad, jacuzzi privado, sala de estar y servicio butler 24h.',
    Costo: 850000,
    Estado: 1,
    ImagenHabitacion: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  },
  {
    NombreHabitacion: 'Suite Ejecutiva Deluxe',
    Descripcion: 'Ideal para viajeros de negocios. Escritorio ejecutivo, acceso a sala VIP, cama king size y desayuno incluido.',
    Costo: 520000,
    Estado: 1,
    ImagenHabitacion: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
  },
  {
    NombreHabitacion: 'Junior Suite Familiar',
    Descripcion: 'Perfecta para familias. Dos camas queen, área de juegos, TV 55", bañera y conexión a habitación doble contigua.',
    Costo: 420000,
    Estado: 1,
    ImagenHabitacion: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
  },
  {
    NombreHabitacion: 'Habitación Superior con Vista al Mar',
    Descripcion: 'Balcón privado con impresionante vista al océano. Cama queen, decoración costera y ropa de cama premium.',
    Costo: 380000,
    Estado: 1,
    ImagenHabitacion: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
  },
  {
    NombreHabitacion: 'Habitación Romántica Jacuzzi',
    Descripcion: 'Diseñada para parejas. Jacuzzi privado en habitación, chimenea decorativa, iluminación tenue y pétalos de rosa.',
    Costo: 460000,
    Estado: 1,
    ImagenHabitacion: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  },
  {
    NombreHabitacion: 'Loft Minimalista',
    Descripcion: 'Diseño contemporáneo en dos niveles. Techo doble altura, cocina equipada, área de trabajo y terraza privada.',
    Costo: 340000,
    Estado: 1,
    ImagenHabitacion: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800',
  },
  {
    NombreHabitacion: 'Habitación Estándar Doble',
    Descripcion: 'Cómoda y funcional. Dos camas dobles, baño completo, TV 43", escritorio y amenities de cortesía.',
    Costo: 195000,
    Estado: 1,
    ImagenHabitacion: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
  },
  {
    NombreHabitacion: 'Suite Ático Panorámica',
    Descripcion: 'En el piso más alto del hotel. Terraza privada de 80m², sala de cine, bar personal y vista 360° a la ciudad.',
    Costo: 1200000,
    Estado: 1,
    ImagenHabitacion: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
  },
  {
    NombreHabitacion: 'Cabañita de Jardín',
    Descripcion: 'Unidad independiente rodeada de jardín tropical. Hamaca privada, ducha al aire libre y acceso directo a la piscina.',
    Costo: 310000,
    Estado: 1,
    ImagenHabitacion: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800',
  },
  {
    NombreHabitacion: 'Habitación Business King',
    Descripcion: 'Cama king size, escritorio amplio, silla ergonómica, impresora y acceso a sala de conferencias privada.',
    Costo: 275000,
    Estado: 1,
    ImagenHabitacion: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
  },
];

const SERVICIOS = [
  { NombreServicio: 'Spa & Masajes Relajantes',    Descripcion: 'Masaje de cuerpo completo con aceites esenciales y aromaterapia.', Duracion: '90 min', CantidadMaximaPersonas: 2, Costo: 180000, Estado: 1 },
  { NombreServicio: 'Desayuno Buffet Premium',      Descripcion: 'Desayuno completo con opciones internacionales, jugos naturales y cafetería.', Duracion: '2 horas', CantidadMaximaPersonas: 4, Costo: 65000, Estado: 1 },
  { NombreServicio: 'Cena Romántica Privada',       Descripcion: 'Cena para dos en terraza privada con menú de 4 tiempos, vino y decoración floral.', Duracion: '2.5 horas', CantidadMaximaPersonas: 2, Costo: 250000, Estado: 1 },
  { NombreServicio: 'Tour Ciudad + Guía Bilingüe',  Descripcion: 'Recorrido guiado por los principales atractivos de la ciudad en vehículo privado.', Duracion: '5 horas', CantidadMaximaPersonas: 6, Costo: 320000, Estado: 1 },
  { NombreServicio: 'Clase de Yoga al Amanecer',    Descripcion: 'Sesión de yoga con instructor certificado en terraza con vista al horizonte.', Duracion: '60 min', CantidadMaximaPersonas: 8, Costo: 55000, Estado: 1 },
  { NombreServicio: 'Servicio de Limpieza VIP',     Descripcion: 'Limpieza adicional de habitación con cambio completo de ropa de cama y amenities.', Duracion: '45 min', CantidadMaximaPersonas: 1, Costo: 45000, Estado: 1 },
  { NombreServicio: 'Traslado Aeropuerto',          Descripcion: 'Servicio de transporte privado desde/hacia el aeropuerto en vehículo de lujo.', Duracion: 'Según trayecto', CantidadMaximaPersonas: 4, Costo: 120000, Estado: 1 },
  { NombreServicio: 'Experiencia Gastronomía Local',Descripcion: 'Recorrido culinario con degustación de 5 platos típicos de la región con chef local.', Duracion: '3 horas', CantidadMaximaPersonas: 6, Costo: 185000, Estado: 1 },
  { NombreServicio: 'Decoración Especial',          Descripcion: 'Habitación decorada con flores, globos, mensajes y botella de champagne cortesía.', Duracion: '1 hora', CantidadMaximaPersonas: 1, Costo: 140000, Estado: 1 },
  { NombreServicio: 'Clase de Cocina Colombiana',   Descripcion: 'Aprende a preparar recetas tradicionales con ingredientes locales junto al chef.', Duracion: '2.5 horas', CantidadMaximaPersonas: 6, Costo: 160000, Estado: 1 },
];

async function main() {
  const db = await mysql.createConnection({
    host    : process.env.DB_HOST     || '127.0.0.1',
    port    : parseInt(process.env.DB_PORT || '3306'),
    user    : process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'hospedaje',
  });

  console.log('✅ Conectado a la base de datos:', process.env.DB_NAME);

  // ── 1. HABITACIONES ──────────────────────────────────────────────────
  console.log('\n📌 Insertando habitaciones...');
  const habIds = [];
  for (const h of HABITACIONES) {
    const [r] = await db.execute(
      'INSERT INTO habitacion (NombreHabitacion, Descripcion, Costo, Estado, ImagenHabitacion) VALUES (?, ?, ?, ?, ?)',
      [h.NombreHabitacion, h.Descripcion, h.Costo, h.Estado, h.ImagenHabitacion]
    );
    habIds.push(r.insertId);
    console.log(`  ✔ ${h.NombreHabitacion} (ID ${r.insertId})`);
  }

  // ── 2. SERVICIOS ─────────────────────────────────────────────────────
  console.log('\n📌 Insertando servicios...');
  const svcIds = [];
  for (const s of SERVICIOS) {
    const [r] = await db.execute(
      'INSERT INTO servicios (NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado) VALUES (?, ?, ?, ?, ?, ?)',
      [s.NombreServicio, s.Descripcion, s.Duracion, s.CantidadMaximaPersonas, s.Costo, s.Estado]
    );
    svcIds.push(r.insertId);
    console.log(`  ✔ ${s.NombreServicio} (ID ${r.insertId})`);
  }

  // ── 3. PAQUETES ──────────────────────────────────────────────────────
  const PAQUETES = [
    {
      NombrePaquete: 'Luna de Miel Inolvidable',
      Descripcion: 'Suite Romántica con Jacuzzi + Cena privada + Decoración especial + Masajes para dos. La experiencia perfecta.',
      IDHabitacion: habIds[4],  // Habitación Romántica Jacuzzi
      IDServicio:   svcIds[2],  // Cena Romántica Privada
      Precio: 1180000,
      Estado: 1,
    },
    {
      NombrePaquete: 'Ejecutivo Todo Incluido',
      Descripcion: 'Suite Ejecutiva + Desayuno premium + Traslado aeropuerto + Limpieza VIP. Para el viajero exigente.',
      IDHabitacion: habIds[1],  // Suite Ejecutiva Deluxe
      IDServicio:   svcIds[6],  // Traslado Aeropuerto
      Precio: 920000,
      Estado: 1,
    },
    {
      NombrePaquete: 'Aventura Familiar',
      Descripcion: 'Junior Suite Familiar + Tour guiado por la ciudad + Desayuno buffet + Clase de cocina para toda la familia.',
      IDHabitacion: habIds[2],  // Junior Suite Familiar
      IDServicio:   svcIds[3],  // Tour Ciudad
      Precio: 1050000,
      Estado: 1,
    },
    {
      NombrePaquete: 'Bienestar & Relajación',
      Descripcion: 'Habitación con vista al mar + Spa y masajes + Yoga al amanecer + Desayuno saludable. Reconecta con tu cuerpo.',
      IDHabitacion: habIds[3],  // Vista al Mar
      IDServicio:   svcIds[0],  // Spa
      Precio: 870000,
      Estado: 1,
    },
    {
      NombrePaquete: 'Gastronomía & Cultura',
      Descripcion: 'Loft Minimalista + Experiencia gastronómica local + Clase de cocina colombiana. Para los amantes de la buena mesa.',
      IDHabitacion: habIds[5],  // Loft Minimalista
      IDServicio:   svcIds[7],  // Gastronomía Local
      Precio: 780000,
      Estado: 1,
    },
    {
      NombrePaquete: 'Ático VIP con Vista 360°',
      Descripcion: 'Suite Ático Panorámica + Cena privada en terraza + Decoración especial + Traslado en limosina.',
      IDHabitacion: habIds[7],  // Suite Ático
      IDServicio:   svcIds[2],  // Cena Romántica
      Precio: 1850000,
      Estado: 1,
    },
    {
      NombrePaquete: 'Escapada de Fin de Semana',
      Descripcion: 'Cabaña de jardín (2 noches) + Desayuno incluido + Clase de yoga + Tour por la ciudad.',
      IDHabitacion: habIds[8],  // Cabañita de Jardín
      IDServicio:   svcIds[4],  // Yoga
      Precio: 690000,
      Estado: 1,
    },
    {
      NombrePaquete: 'Business Elite',
      Descripcion: 'Habitación Business King + Traslado aeropuerto + Limpieza VIP diaria + Desayuno ejecutivo.',
      IDHabitacion: habIds[9],  // Business King
      IDServicio:   svcIds[6],  // Traslado
      Precio: 640000,
      Estado: 1,
    },
    {
      NombrePaquete: 'Presidencial Supreme',
      Descripcion: 'Suite Presidencial completa + Spa exclusivo + Cena privada + Decoración + Desayuno en cama. Lo mejor de lo mejor.',
      IDHabitacion: habIds[0],  // Suite Presidencial
      IDServicio:   svcIds[0],  // Spa
      Precio: 2400000,
      Estado: 1,
    },
    {
      NombrePaquete: 'Estándar Cómodo Familiar',
      Descripcion: 'Habitación Estándar Doble + Desayuno completo + Tour por la ciudad. Ideal para explorar sin gastar de más.',
      IDHabitacion: habIds[6],  // Habitación Estándar Doble
      IDServicio:   svcIds[3],  // Tour Ciudad
      Precio: 430000,
      Estado: 1,
    },
  ];

  console.log('\n📌 Insertando paquetes...');
  for (const p of PAQUETES) {
    const [r] = await db.execute(
      'INSERT INTO paquetes (NombrePaquete, Descripcion, IDHabitacion, IDServicio, Precio, Estado) VALUES (?, ?, ?, ?, ?, ?)',
      [p.NombrePaquete, p.Descripcion, p.IDHabitacion, p.IDServicio, p.Precio, p.Estado]
    );
    console.log(`  ✔ ${p.NombrePaquete} (ID ${r.insertId})`);
  }

  // ── Resumen Final ─────────────────────────────────────────────────────
  const [ch] = await db.execute('SELECT COUNT(*) as n FROM habitacion WHERE Estado=1');
  const [cs] = await db.execute('SELECT COUNT(*) as n FROM servicios  WHERE Estado=1');
  const [cp] = await db.execute('SELECT COUNT(*) as n FROM paquetes   WHERE Estado=1');

  console.log('\n════════════════════════════════════');
  console.log('🎉 SEED COMPLETADO EXITOSAMENTE');
  console.log(`   🛏️  Habitaciones activas : ${ch[0].n}`);
  console.log(`   ☕  Servicios activos    : ${cs[0].n}`);
  console.log(`   📦  Paquetes activos     : ${cp[0].n}`);
  console.log('════════════════════════════════════\n');

  await db.end();
}

main().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
