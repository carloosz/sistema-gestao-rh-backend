async function clearTestData() {
  if (!global.strapi) {
    throw new Error('Strapi não está disponível');
  }

  // Limpa dados de teste
  await global.strapi.db.query("plugin::users-permissions.user").deleteMany({});
  await global.strapi.db.query("api::client.client").deleteMany({});
}

module.exports = {
  clearTestData,
};
