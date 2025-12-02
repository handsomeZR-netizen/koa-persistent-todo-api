const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const { koaSwagger } = require('koa2-swagger-ui');
const router = require('./routes');
const swaggerSpec = require('./swagger');
const path = require('path');

const app = new Koa();
const PORT = process.env.PORT || 3000;

// 全局错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: {
        message: err.message || '服务器内部错误',
        code: 'INTERNAL_ERROR'
      }
    };
    console.error('Error:', err);
  }
});

// 注册中间件
app.use(bodyParser());

// 静态文件服务
app.use(serve(path.join(__dirname, 'public')));

// Favicon 处理
app.use(async (ctx, next) => {
  if (ctx.path === '/favicon.ico') {
    ctx.status = 204;
    return;
  }
  await next();
});

// Swagger JSON 端点
app.use(async (ctx, next) => {
  if (ctx.path === '/swagger.json') {
    ctx.body = swaggerSpec;
    return;
  }
  await next();
});

// Swagger UI
app.use(
  koaSwagger({
    routePrefix: '/swagger',
    swaggerOptions: {
      spec: swaggerSpec
    }
  })
);

app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Todo API 服务运行在 http://localhost:${PORT}`);
  });
}

module.exports = app;
