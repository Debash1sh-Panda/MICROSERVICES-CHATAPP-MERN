import amqp from "amqplib";
import nodemailer from "nodemailer";

let connection;
let channel: any;

const EXCHANGE_NAME = "MAIL_EXCHANGE";

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URI!);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: false });
    console.log("RabbitMQ connected ✔");

    return channel;
  } catch (error) {
    console.error("RabbitMQ Connection Error ❌", error);
    setTimeout(connectRabbitMQ, 5000); // Retry after 5 seconds
  }
}

export const consumeEvent = async (routingKey: string, callback: any) => {
  try {
    if (!channel) {
      channel = await connectRabbitMQ();
    }
    const q = await channel.assertQueue("", { exclusive: true });
    channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    channel.consume(q.queue, (msg: any) => {
      if (msg.content) {
        const message = JSON.parse(msg.content.toString());
        callback(message);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("Error consuming event to RabbitMQ", error);
  }
};

export default connectRabbitMQ;
