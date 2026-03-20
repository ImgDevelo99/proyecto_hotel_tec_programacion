/**
 * TEST COMPLETO: GET, POST, PUT, DELETE para las 13 tablas.
 * Inserta, consulta, actualiza y elimina un registro de prueba en cada tabla.
 */
const http = require('http');
const BASE = 'http://localhost:3000/api';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const opts = { hostname: url.hostname, port: url.port, path: url.pathname, method, headers: { 'Content-Type': 'application/json' } };
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ s: res.statusCode, b: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, b: d }); } });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function icon(ok) { return ok ? '✅' : '❌'; }

async function testCRUD(name, path, createData, updateData, getId) {
  const pad = name.padEnd(26);
  let passed = 0, total = 5;

  // 1. POST
  const postR = await req('POST', path, createData);
  const postOk = postR.s === 201;
  console.log(`  ${icon(postOk)} POST   ${pad} → ${postR.s} ${postOk ? '' : JSON.stringify(postR.b)}`);
  if (postOk) passed++;
  else return { name, passed, total };

  const id = getId(postR.b);

  // 2. GET all
  const getAll = await req('GET', path);
  const getAllOk = getAll.s === 200 && Array.isArray(getAll.b);
  console.log(`  ${icon(getAllOk)} GET    ${pad} → ${getAll.s} (${getAllOk ? getAll.b.length + ' registros' : 'ERROR'})`);
  if (getAllOk) passed++;

  // 3. GET by id
  const getOne = await req('GET', `${path}/${id}`);
  const getOneOk = getOne.s === 200;
  console.log(`  ${icon(getOneOk)} GET/:id${pad} → ${getOne.s}`);
  if (getOneOk) passed++;

  // 4. PUT
  const putR = await req('PUT', `${path}/${id}`, updateData);
  const putOk = putR.s === 200;
  console.log(`  ${icon(putOk)} PUT    ${pad} → ${putR.s} ${putOk ? '' : JSON.stringify(putR.b)}`);
  if (putOk) passed++;

  // 5. DELETE
  const delR = await req('DELETE', `${path}/${id}`);
  const delOk = delR.s === 200;
  console.log(`  ${icon(delOk)} DELETE ${pad} → ${delR.s}`);
  if (delOk) passed++;

  return { name, passed, total, id: postOk ? id : null };
}

async function run() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   HOTEL SYSTEM API — TEST COMPLETO CRUD (13 tablas)     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const summary = [];

  // ═══════════════════════════════════════════
  // GRUPO 1: Catálogos (sin FK)
  // ═══════════════════════════════════════════
  console.log('── Catálogos ──────────────────────────────────────────');

  // Roles
  let r = await testCRUD('Roles', '/roles',
    { Nombre: 'TestRol', Estado: 'Activo', IsActive: true },
    { Nombre: 'TestRolUpd', Estado: 'Inactivo', IsActive: false },
    b => b.id);
  summary.push(r);

  // Permisos
  r = await testCRUD('Permisos', '/permisos',
    { NombrePermisos: 'TestPermiso', EstadoPermisos: 'Activo', Descripcion: 'Desc test', IsActive: true },
    { NombrePermisos: 'TestPermisoUpd', EstadoPermisos: 'Inactivo', Descripcion: 'Desc upd', IsActive: false },
    b => b.id);
  summary.push(r);

  // EstadosReserva
  r = await testCRUD('EstadosReserva', '/estados-reserva',
    { NombreEstadoReserva: 'TestEstado' },
    { NombreEstadoReserva: 'TestEstadoUpd' },
    b => b.id);
  summary.push(r);

  // MetodoPago
  r = await testCRUD('MetodoPago', '/metodos-pago',
    { NomMetodoPago: 'TestMetodo' },
    { NomMetodoPago: 'TestMetodoUpd' },
    b => b.id);
  summary.push(r);

  // Servicios
  r = await testCRUD('Servicios', '/servicios',
    { NombreServicio: 'TestServ', Descripcion: 'Desc test', Duracion: '1h', CantidadMaximaPersonas: 3, Costo: 80000, Estado: true },
    { NombreServicio: 'TestServUpd', Descripcion: 'Desc upd', Duracion: '2h', CantidadMaximaPersonas: 6, Costo: 120000, Estado: false },
    b => b.id);
  summary.push(r);

  // Habitacion
  r = await testCRUD('Habitacion', '/habitaciones',
    { NombreHabitacion: 'TestHab', Descripcion: 'Desc test', Costo: 200000, Estado: true },
    { NombreHabitacion: 'TestHabUpd', Descripcion: 'Desc upd', Costo: 300000, Estado: false },
    b => b.id);
  summary.push(r);

  // ═══════════════════════════════════════════
  // GRUPO 2: Tablas con FK (necesitan datos previos)
  // ═══════════════════════════════════════════
  console.log('\n── Tablas con FK ──────────────────────────────────────');

  // Crear dependencias temporales
  const depRol = await req('POST', '/roles', { Nombre: 'DepRol', Estado: 'Activo', IsActive: true });
  const depPerm = await req('POST', '/permisos', { NombrePermisos: 'DepPerm', EstadoPermisos: 'Activo', Descripcion: 'dep', IsActive: true });
  const depEst = await req('POST', '/estados-reserva', { NombreEstadoReserva: 'DepEstado' });
  const depMP = await req('POST', '/metodos-pago', { NomMetodoPago: 'DepMetodo' });
  const depServ = await req('POST', '/servicios', { NombreServicio: 'DepServ', Descripcion: 'dep', Duracion: '1h', CantidadMaximaPersonas: 2, Costo: 50000, Estado: true });
  const depHab = await req('POST', '/habitaciones', { NombreHabitacion: 'DepHab', Descripcion: 'dep', Costo: 100000, Estado: true });

  const rId = depRol.b.id, pId = depPerm.b.id, eId = depEst.b.id, mId = depMP.b.id, sId = depServ.b.id, hId = depHab.b.id;

  // RolesPermisos
  r = await testCRUD('RolesPermisos', '/roles-permisos',
    { IDRol: rId, IDPermiso: pId },
    { IDRol: rId, IDPermiso: pId },
    b => b.id);
  summary.push(r);

  // Usuarios
  r = await testCRUD('Usuarios', '/usuarios',
    { NombreUsuario: 'testuser', Contrasena: '123', Apellido: 'Test', Email: 'test@t.com', TipoDocumento: 'CC', NumeroDocumento: 11111, Telefono: '000', Pais: 'CO', Direccion: 'Dir test', IDRol: rId },
    { NombreUsuario: 'testuserupd', Contrasena: '456', Apellido: 'Upd', Email: 'upd@t.com', TipoDocumento: 'PP', NumeroDocumento: 22222, Telefono: '111', Pais: 'MX', Direccion: 'Dir upd', IDRol: rId },
    b => b.id);
  summary.push(r);
  const uId = r.id;

  // Crear usuario para Reserva
  const depUsr = await req('POST', '/usuarios', { NombreUsuario: 'depusr', Contrasena: '123', Apellido: 'Dep', Email: 'dep@t.com', TipoDocumento: 'CC', NumeroDocumento: 33333, Telefono: '222', Pais: 'CO', Direccion: 'Dep dir', IDRol: rId });
  const depUsrId = depUsr.b.id;

  // Clientes
  r = await testCRUD('Clientes', '/clientes',
    { NroDocumento: 'TEST00001', Nombre: 'TestNombre', Apellido: 'TestApellido', Direccion: 'Dir test', Email: 'clitest@t.com', Telefono: '333', Estado: 1 },
    { NroDocumento: 'TEST00001', Nombre: 'TestNomUpd', Apellido: 'TestApUpd', Direccion: 'Dir upd', Email: 'cliupd@t.com', Telefono: '444', Estado: 0 },
    b => b.NroDocumento);
  summary.push(r);

  // Paquetes
  r = await testCRUD('Paquetes', '/paquetes',
    { NombrePaquete: 'TestPaq', Descripcion: 'paq desc test', IDHabitacion: hId, IDServicio: sId, Precio: 250000, Estado: true },
    { NombrePaquete: 'TestPaqUpd', Descripcion: 'paq desc upd', IDHabitacion: hId, IDServicio: sId, Precio: 350000, Estado: false },
    b => b.id);
  summary.push(r);

  // Crear paquete para detalle
  const depPaq = await req('POST', '/paquetes', { NombrePaquete: 'DepPaq', Descripcion: 'dep paq', IDHabitacion: hId, IDServicio: sId, Precio: 100000, Estado: true });
  const depPaqId = depPaq.b.id;

  // Reserva
  r = await testCRUD('Reserva', '/reservas',
    { NroDocumentoCliente: null, FechaReserva: '2025-08-01 10:00:00', FechaInicio: '2025-08-10', FechaFinalizacion: '2025-08-15', SubTotal: 1000000, Descuento: 100000, IVA: 171000, MontoTotal: 1071000, MetodoPago: mId, IdEstadoReserva: eId, UsuarioIdusuario: depUsrId },
    { NroDocumentoCliente: null, FechaReserva: '2025-08-02 12:00:00', FechaInicio: '2025-08-11', FechaFinalizacion: '2025-08-16', SubTotal: 1200000, Descuento: 150000, IVA: 199500, MontoTotal: 1249500, MetodoPago: mId, IdEstadoReserva: eId, UsuarioIdusuario: depUsrId },
    b => b.id);
  summary.push(r);

  // Crear reserva para detalles
  const depRes = await req('POST', '/reservas', { NroDocumentoCliente: null, FechaReserva: '2025-09-01 10:00:00', FechaInicio: '2025-09-10', FechaFinalizacion: '2025-09-15', SubTotal: 500000, Descuento: 0, IVA: 95000, MontoTotal: 595000, MetodoPago: mId, IdEstadoReserva: eId, UsuarioIdusuario: depUsrId });
  const depResId = depRes.b.id;

  // DetalleReservaPaquetes
  r = await testCRUD('DetalleReservaPaquetes', '/detalle-reserva-paquetes',
    { IDReserva: depResId, Cantidad: 1, Precio: 100000, Estado: true, IDPaquete: depPaqId },
    { IDReserva: depResId, Cantidad: 2, Precio: 200000, Estado: false, IDPaquete: depPaqId },
    b => b.id);
  summary.push(r);

  // DetalleReservaServicio
  r = await testCRUD('DetalleReservaServicio', '/detalle-reserva-servicio',
    { IDReserva: depResId, Cantidad: 1, Precio: 50000, Estado: true, IDServicio: sId },
    { IDReserva: depResId, Cantidad: 3, Precio: 150000, Estado: false, IDServicio: sId },
    b => b.id);
  summary.push(r);

  // Limpiar dependencias
  await req('DELETE', '/reservas/' + depResId);
  await req('DELETE', '/paquetes/' + depPaqId);
  await req('DELETE', '/usuarios/' + depUsrId);
  await req('DELETE', '/habitaciones/' + hId);
  await req('DELETE', '/servicios/' + sId);
  await req('DELETE', '/metodos-pago/' + mId);
  await req('DELETE', '/estados-reserva/' + eId);
  await req('DELETE', '/permisos/' + pId);
  await req('DELETE', '/roles/' + rId);

  // ═══════════════════════════════════════════
  // RESUMEN FINAL
  // ═══════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMEN FINAL                        ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  let totalP = 0, totalT = 0;
  for (const s of summary) {
    const status = s.passed === s.total ? '✅ PASS' : '❌ FAIL';
    console.log(`║  ${status}  ${s.name.padEnd(24)} ${s.passed}/${s.total}            ║`);
    totalP += s.passed;
    totalT += s.total;
  }
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  TOTAL: ${totalP}/${totalT} pruebas pasaron                        ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  process.exit(totalP === totalT ? 0 : 1);
}

run();
