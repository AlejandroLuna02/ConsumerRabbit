import { connect as _connect } from 'amqplib';
import axios from 'axios';

const rabbitSettings = {
  protocol: 'amqp',
  hostname: '54.204.104.121',
  port: 5672,
  username: 'aleluna',
  password: '15082002'
};

async function connect() {
  const queue = 'InitialEvent';
  try {
    const conn = await _connect(rabbitSettings);
    console.log('Conexión exitosa');
    const channel = await conn.createChannel();
    console.log('Canal creado exitosamente');

    channel.consume(queue, async (msn) => {
      const messageContent = msn.content.toString();
      console.log(messageContent);
      try {
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'http://52.3.122.85:4000/products/',
          headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json'
          },
          data : messageContent
        };
        const response = await axios.request(config);

        if (response.status === 201) {
          console.log('Mensaje enviado a la API');
        } else {
          console.error('Error al enviar mensaje');
        }
      } catch (error) {
        console.error('Error al llamar la API', error);
      }
      channel.ack(msn);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

connect();
