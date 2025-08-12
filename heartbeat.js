// heartbeat.js
const fastify = require('fastify')({ logger: true });
require('dotenv').config();

const PORT = process.env.PORT || 3000;

fastify.get('/', async () => ({ message: 'Mozaik: hello world' }));

fastify.get('/health', async () => ({
  status: 'ok',
  service: 'mozaik',
  time: new Date().toISOString()
}));

fastify.get('/pulse', async () => ({
  pulse: Math.random().toString(36).slice(2, 8),
  time: Date.now()
}));

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🔊 Mozaik heartbeat running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
