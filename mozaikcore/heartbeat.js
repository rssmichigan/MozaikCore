const fastify = require('fastify')({ logger: true });
require('dotenv').config();
const pkg = require('./package.json');

// CORS
const cors = require('@fastify/cors');

// Postgres client
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function startServer() {
  await fastify.register(cors, { origin: true });

  const PORT = process.env.PORT || 3000;

  // basic routes
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

  fastify.get('/version', async () => ({
    name: pkg.name,
    version: pkg.version,
    node: process.version
  }));

  // DB health route
  fastify.get('/db-check', async () => {
    const { rows } = await pool.query('SELECT NOW() AS now');
    return { ok: true, now: rows[0].now };
  });try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
// --- /api/agent: placeholder model + DB logging ---
fastify.post('/api/agent', async (request, reply) => {
  try {
    const { prompt, model } = request.body || {};
    if (!prompt) return reply.code(400).send({ error: 'prompt is required' });

    const chosenModel = model || 'gpt-4o-mini';

    // Placeholder output for now (we'll swap to OpenAI next)
    const text = `Echo from ${chosenModel}: ${prompt}`;

    // Log to Postgres
    await pool.query(
      'INSERT INTO agent_runs (prompt, output, model) VALUES ($1, $2, $3)',
      [prompt, text, chosenModel]
    );

    return { prompt, output: text, model: chosenModel };
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: 'agent_run_failed' });
  }
});
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🔊 Mozaik heartbeat running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();
