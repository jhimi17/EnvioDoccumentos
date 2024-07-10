const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Ruta POST para enviar documentos
app.post('/sendDocuments', async (req, res) => {
  const documents = req.body.documents;

  // Verificar que los documentos sean un arreglo y estén entre 50 y 100
  if (!Array.isArray(documents) || documents.length < 50 || documents.length > 100) {
    return res.status(400).send('Por favor envíe entre 50 y 100 documentos.');
  }

  try {
    // Enviar documentos a procesoDoc_api
    const response = await axios.post('http://localhost:3001/processDocuments', { documents });
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error enviando documentos: ' + error.message);
  }
});

// Ruta POST para actualizar el estado de los documentos
app.post('/updateStatus', (req, res) => {
  const document = req.body;
  console.log('Actualización de estado recibida:', document);

  // Aquí podrías actualizar tu base de datos o almacenamiento con el nuevo estado

  res.send({ message: 'Estado actualizado' });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('cliente_api escuchando en el puerto 3000');
});
