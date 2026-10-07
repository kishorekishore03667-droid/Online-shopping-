const serverless = require('serverless-http');
const app = require('../../server');
const { seedDatabase } = require('../../src/models/seed');

let isInitialized = false;

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Ensure database schema and seed data are ready on cold start
  if (!isInitialized) {
    try {
      await seedDatabase();
      isInitialized = true;
    } catch (e) {
      console.error('Netlify function seed error:', e.message);
    }
  }

  return handler(event, context);
};
