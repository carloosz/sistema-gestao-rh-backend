require('dotenv').config({ path: '.env.test' });

const { spawn } = require('child_process');

async function runTests() {
  let instance;

  try {
    console.log('Iniciando Strapi para testes...');
    console.log('Usando banco:', process.env.TEST_DATABASE_NAME || 'sgrh_test');

    const Strapi = require('@strapi/strapi');

    instance = await Strapi.createStrapi().load();
    await instance.server.mount();

    global.strapi = instance;

    console.log('Strapi iniciado! Rodando testes...\n');

    const jest = spawn('npx', ['jest', '--forceExit', '--detectOpenHandles', '--runInBand'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' },
      shell: true,
    });

    jest.on('close', async (code) => {
      console.log('Limpando...');
      if (instance) {
        await instance.destroy();
      }
      process.exit(code);
    });

  } catch (error) {
    console.error('Erro:', error.message);
    if (instance) {
      await instance.destroy();
    }
    process.exit(1);
  }
}

runTests();
