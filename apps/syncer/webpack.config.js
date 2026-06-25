module.exports = (options) => {
  return {
    ...options,
    externals: [
      ...(options.externals || []),
      'kafkajs',
      'mqtt',
      'nats',
      'ioredis',
      'amqplib',
      'amqp-connection-manager',
      '@nestjs/websockets/socket-module',
      '@nestjs/microservices/microservices-module',
    ],
  };
};
