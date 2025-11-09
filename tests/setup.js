const { createStrapi } = require('@strapi/strapi');

require('dotenv').config({ path: '.env.test' });
process.env.NODE_ENV = 'test';

let instance;

exports.mochaHooks = {
  async beforeAll() {
    this.timeout(120000);

    console.log('Inicializando Strapi v5...');

    instance = await createStrapi();
    await instance.start();

    global.strapi = instance;

    console.log('Strapi pronto!');
    console.log('Modelos disponíveis:', Object.keys(instance.db.metadata));
  },

  async afterAll() {
    this.timeout(30000);

    if (instance) {
      console.log('Finalizando Strapi...');

      await instance.stop();
      await instance.destroy();

      console.log('Strapi finalizado!');
    }
  }
};
