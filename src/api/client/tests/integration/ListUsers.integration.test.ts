import { expect } from '@jest/globals';
import { createStrapi } from '@strapi/strapi';
import { ListUsers } from '../../services/ListUsers';

let instance: any;
let listUsersService: ListUsers;

describe('ListUsers Service', () => {
  jest.setTimeout(120000);

  beforeAll(async () => {
    console.log('Inicializando Strapi v5...');
    instance = await createStrapi();
    await instance.start();
    global.strapi = instance;
    listUsersService = new ListUsers();
    console.log('Strapi pronto!');
  });

  afterAll(async () => {
    if (instance) {
      console.log('Finalizando Strapi...');
      await instance.destroy();
    }
  });

  beforeEach(async () => {
    console.log('Limpando dados de teste...');
    try {
      await instance.db.query("plugin::users-permissions.user").deleteMany({});
      await instance.db.query("api::client.client").deleteMany({});
      console.log('Dados limpos com sucesso');
    } catch (error: any) {
      console.error('Erro ao limpar dados:', error.message);
    }
  });

  it('deve retornar lista de usuários com paginação padrão', async () => {
    console.log('\nTeste: Paginação padrão');

    // 1. Criar client
    const testClient = await instance.db.query("api::client.client").create({
      data: {
        name: "João Silva",
        registrationNumber: "12345",
        phone: "11999999999",
        isActive: true,
      },
    });
    console.log('Client criado:', testClient.id);

    // 2. Criar usuário
    const user = await instance.db.query("plugin::users-permissions.user").create({
      data: {
        username: "joao.silva",
        email: "joao@example.com",
        password: "password123",
        confirmed: true,
        blocked: false,
        role: 1,
        client: testClient.id,
      },
    });
    console.log('Usuário criado:', user.id);

    // 3. Chamar serviço
    const ctx = { request: { query: {} } };
    const result = await listUsersService.listUsers(ctx);
    console.log('Resultado:', JSON.stringify(result, null, 2));

    // 4. Validações
    expect(result).toBeDefined();
    expect(result.users).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(9);
    expect(result.totalItems).toBe(1);
    expect(result.users[0].name).toBe("João Silva");

    console.log('Teste passou!');
  });
});
