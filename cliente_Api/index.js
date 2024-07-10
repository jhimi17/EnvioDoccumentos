const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

let documentsToCheck = [];

// Ruta POST para enviar documentos
app.post('/sendDocuments', async (req, res) => {
  const documents = req.body.documents;

  if (!Array.isArray(documents) || documents.length < 5 || documents.length > 100) {
    return res.status(400).send('Por favor envíe entre 5 y 100 documentos.');
  }

  documentsToCheck = documents.map(doc => ({ ...doc, status: 'En Proceso' }));

  try {
    const response = await axios.post('http://localhost:3001/processDocuments', { documents });
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error enviando documentos: ' + error.message);
  }

  // Iniciar el proceso de consulta periódica
  checkDocumentStatus();
});

// Función para consultar el estado de los documentos periódicamente
async function checkDocumentStatus() {
  const interval = setInterval(async () => {
    try {
      const response = await axios.post('http://localhost:3001/checkDocumentStatus', { documents: documentsToCheck });
      documentsToCheck = response.data.documents;

      console.log('Estados de documentos actualizados:', documentsToCheck);

      const allProcessed = documentsToCheck.every(doc => doc.status === 'Rechazado' || doc.status === 'Aceptado');

      if (allProcessed) {
        clearInterval(interval);
        console.log('Todos los documentos han sido procesados.');
      }
    } catch (error) {
      console.error('Error consultando el estado de los documentos:', error.message);
    }
  }, 60000); // Consulta cada 1 minuto
}

// Ruta POST para actualizar el estado de los documentos
app.post('/updateStatus', (req, res) => {
  const document = req.body;
  console.log('Actualización de estado recibida:', document);

 

  res.send({ message: 'Estado actualizado' });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('cliente_api escuchando en el puerto 3000');
});
