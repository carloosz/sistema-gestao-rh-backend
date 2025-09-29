module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      strapi.log.error('Error:', error);
      
      if (error.name === 'ValidationError' || 
          error.name === 'ApplicationError' ||
          error.message?.includes('Invalid identifier or password')) {
        
        ctx.status = error.status || 400;
        ctx.body = {
          data: null,
          error: {
            status: ctx.status,
            name: error.name || 'ValidationError',
            message: error.message,
            details: error.details || {}
          }
        };
        return;
      }
      
      if (error.status && error.status < 500) {
        ctx.status = error.status;
        ctx.body = {
          data: null,
          error: {
            status: error.status,
            name: error.name,
            message: error.message,
            details: error.details || {}
          }
        };
        return;
      }
      
      ctx.status = error.status || 500;
      ctx.body = {
        data: null,
        error: {
          status: ctx.status,
          name: 'InternalServerError',
          message: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : error.message,
          details: {}
        }
      };
    }
  };
};