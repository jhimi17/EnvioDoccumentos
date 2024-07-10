2 servicios: cliente_Api, y el servicio procesoDoc_Api, en Node.js y RabitMQ.

cliente_Api enviara documentos al servicio procesoDoc_APi, el envió sera por APIREST (Json), puede ser de 5 documentos a mas al mismo tiempo, cada 1 minuto el cliente_Api consultara el estado de los documentos enviados. Hasta que tenga una confirmación: "Rechazado" o "Aceptado".

Servicio procesoDoc_Api, ese servicio tendrá 2 EndPoints:

primer endpoint: Recepcionara los documentos y enviara un mensaje "En
Proceso", al cliente_Api.

segundo endpoint: Aqui se realizaran las consultas del estado del documento "Rechazado" o "Aceptado".

En el servicio procesoDoc_Api los documentos que recepciono, despues de 1 minuto, que cambie del estado de "En Proceso" a un nuevo estado "Rechazado" o "Aceptado", el nuevo estado sera de manera aleatoria. y saldra de la cola de RabbitMQ, y mostrara en que estado se encuentran los documentos cada que sean consultados.
