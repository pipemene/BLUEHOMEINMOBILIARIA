const requiredEnv = ['PORT', 'INTERNAL_API_KEY'];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[config] Variable de entorno ${key} no está definida. Revisa tu archivo .env`);
  }
});

module.exports = {
  port: process.env.PORT || 3000,
  internalApiKey: process.env.INTERNAL_API_KEY || null,
  frontendOrigin: process.env.FRONTEND_ORIGIN || '*',
  google: {
    projectId: process.env.GOOGLE_PROJECT_ID,
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined
  },
  drive: {
    ordersFolderId: process.env.DRIVE_ORDERS_FOLDER_ID,
    signedPdfsFolderId: process.env.DRIVE_SIGNED_PDFS_FOLDER_ID
  }
};
