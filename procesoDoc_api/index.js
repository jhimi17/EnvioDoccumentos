const express = require('express');
const amqp = require('amqplib');
const axios = require('axios');

const app = express();
app.use(express.json());

let documents = [];

// Función para conectar a RabbitMQ
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://guest:guest@localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('documentsQueue');
    return channel;
  } catch (error) {
    console.error('Error conectando a RabbitMQ', error);
    process.exit(1);
  }
}

// Ruta POST para procesar documentos
app.post('/processDocuments', async (req, res) => {
  documents = req.body.documents.map(doc => ({ ...doc, status: 'En Proceso' }));

  try {
    const channel = await connectRabbitMQ();

    documents.forEach(doc => {
      channel.sendToQueue('documentsQueue', Buffer.from(JSON.stringify(doc)));
    });

    // Enviar mensaje de "En Proceso" a cliente_api
    await Promise.all(documents.map(doc => axios.post('http://localhost:3000/updateStatus', doc)));

    res.send({ message: 'Documentos en proceso' });

    // Cambiar estado de los documentos después de 1 minuto
    setTimeout(() => {
      documents = documents.map(doc => {
        doc.status = Math.random() > 0.5 ? 'Aceptado' : 'Rechazado';
        return doc;
      });
      console.log('Estados de documentos actualizados:', documents);
    }, 60000); // 1 minuto
  } catch (error) {
    res.status(500).send('Error procesando documentos: ' + error.message);
  }
});

// Ruta POST para consultar el estado de los documentos
app.post('/checkDocumentStatus', (req, res) => {
  const requestDocs = req.body.documents;
  const responseDocs = requestDocs.map(reqDoc => {
    const doc = documents.find(d => d.id === reqDoc.id);
    return doc ? { ...reqDoc, status: doc.status } : reqDoc;
  });

  res.send({ documents: responseDocs });
});

// Iniciar el servidor
app.listen(3001, () => {
  console.log('procesoDoc_api escuchando en el puerto 3001');
});
