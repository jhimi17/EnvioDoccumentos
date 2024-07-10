En el siguiente proyecto se crearon dos servicios en Node.js y RabbitMQ:
1. Servicio Cliente (cliente_Api): 
   - Recibe un arreglo de documentos del cliente. Verifica que el número de documentos esté entre 5 y 100.
   - Este servicio podrá enviar, mediante una API REST (JSON)
   - Cada minuto, consultará automáticamente el estado de los documentos enviados que puede ser "en proceso", "Rechazado" o "Aceptado".
2. Servicio Estado Documento (procesoDoc_Api):
	- Recibe documentos del cliente_Api y los coloca en una cola de RabbitMQ.
	- Informa al cliente_Api que los documentos están "En Proceso".
      - Cambia el estado de los documentos de "En Proceso" a "Rechazado" o "Aceptado" después de un minuto.
	- Permite al cliente_Api consultar el estado actual de los documentos.

	Descripción del diagrama (Se realizo en Lucidchart para trabajar de manera colaborativa):
1. El cliente_Api envía documentos al procesoDoc_Api a través de API REST.
2. El procesoDoc_Api recibe los documentos y coloca en la cola de RabbitMQ luego envía un estado "En Proceso" de vuelta al cliente_Api.
3. Después de un minuto, el procesoDoc_Api cambia aleatoriamente el estado de los documentos a "Rechazado" o "Aceptado".
4. El cliente_Api consulta periódicamente el estado de los documentos hasta que reciban una confirmación final de aceptado o rechazado.
