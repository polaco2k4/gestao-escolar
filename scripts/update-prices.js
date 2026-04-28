const knex = require('knex');
require('dotenv').config();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'gestao_escolar',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
});

async function run() {
  try {
    await db('license_plans').where('name', 'basic').update({ price_monthly: 25000 });
    await db('license_plans').where('name', 'premium').update({ price_monthly: 65000 });
    await db('license_plans').where('name', 'enterprise').update({ price_monthly: 150000 });

    const plans = await db('license_plans').select('display_name', 'price_monthly').orderBy('price_monthly');
    console.log('Precos atualizados para Kwanza (Kz):');
    plans.forEach(p => console.log('  ' + p.display_name + ': Kz ' + p.price_monthly));
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await db.destroy();
  }
}

run();
