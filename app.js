const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('./routes');

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
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Todo API 服务运行在 http://localhost:${PORT}`);
  });
}

module.exports = app;
