const express = require('express');
const amqp = require('amqplib');
const axios = require('axios');

const app = express();
app.use(express.json());

// Función para conectar a RabbitMQ
async function connectRabbitMQ() {
  try {
    // Conectar a RabbitMQ usando las credenciales predeterminadas
    const connection = await amqp.connect('amqp://guest:guest@localhost');
    // Crear un canal de comunicación
    const channel = await connection.createChannel();
    // Asegurarse de que la cola 'documentsQueue' exista
    await channel.assertQueue('documentsQueue');
    return channel;
  } catch (error) {
    console.error('Error conectando a RabbitMQ', error);
    process.exit(1); // Salir del proceso en caso de error
  }
}

// Ruta POST para procesar documentos
app.post('/processDocuments', async (req, res) => {
  const documents = req.body.documents;

  // Verificar que los documentos sean un arreglo
  if (!Array.isArray(documents)) {
    return res.status(400).send('Formato de documento inválido');
  }

  try {
    // Conectar a RabbitMQ
    const channel = await connectRabbitMQ();

    // Enviar cada documento a la cola con estado 'en proceso'
    documents.forEach(doc => {
      const status = { ...doc, status: 'en proceso' };
      channel.sendToQueue('documentsQueue', Buffer.from(JSON.stringify(status)));
    });

    // Procesar cada documento y actualizar el estado
    const processedDocuments = await processDocuments(channel, documents);

    res.send(processedDocuments);
  } catch (error) {
    res.status(500).send('Error procesando documentos: ' + error.message);
  }
});

// Función para procesar documentos y actualizar su estado
async function processDocuments(channel, documents) {
  const processedDocuments = documents.map(doc => {
    // Asignar un estado aleatorio de 'aceptado' o 'rechazado' al documento
    const status = { ...doc, status: Math.random() > 0.5 ? 'aceptado' : 'rechazado' };
    return status;
  });

  // Enviar actualizaciones de estado de vuelta a cliente_api
  processedDocuments.forEach(async doc => {
    await axios.post('http://localhost:3000/updateStatus', doc);
  });

  return processedDocuments;
}

// Función para procesar la cola de RabbitMQ
async function processQueue() {
  const channel = await connectRabbitMQ();
  // Consumir mensajes de la cola 'documentsQueue'
  channel.consume('documentsQueue', async (msg) => {
    if (msg !== null) {
      const document = JSON.parse(msg.content.toString());
      console.log('Procesando documento:', document);
      // Confirmar que el mensaje ha sido procesado
      channel.ack(msg);
    }
  });
}

// Iniciar el servidor
app.listen(3001, () => {
  console.log('procesoDoc_api escuchando en el puerto 3001');
  processQueue(); // Iniciar el procesamiento de la cola
});
