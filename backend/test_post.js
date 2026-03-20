const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPost() {
  try {
    const response = await fetch('http://localhost:3000/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Nombre: "Test",
        Apellido: "User",
        Documento: "999999",
        Email: "test@test.com",
        Teléfono: "123456"
      })
    });
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testPost();
