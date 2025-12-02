const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { loadTodos, saveTodos } = require('./storage');

const router = new Router();

/**
 * GET /api/todos - 获取所有任务
 */
router.get('/api/todos', async (ctx) => {
  const todos = await loadTodos();
  ctx.status = 200;
  ctx.body = todos;
});

/**
 * POST /api/todos - 创建新任务
 */
router.post('/api/todos', async (ctx) => {
  const { title, completed } = ctx.request.body;

  // 验证 title 字段
  if (!title || typeof title !== 'string' || title.trim() === '') {
    ctx.status = 400;
    ctx.body = {
      error: {
        message: 'title 字段是必需的且必须是非空字符串',
        code: 'INVALID_TITLE'
      }
    };
    return;
  }

  // 创建新任务
  const newTodo = {
    id: uuidv4(),
    title: title,
    completed: completed !== undefined ? completed : false,
    createdAt: new Date().toISOString()
  };

  // 保存到存储
  const todos = await loadTodos();
  todos.push(newTodo);
  await saveTodos(todos);

  ctx.status = 201;
  ctx.body = newTodo;
});

/**
 * POST /api/todos/:id - 更新任务
 */
router.post('/api/todos/:id', async (ctx) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;

  const todos = await loadTodos();
  const todoIndex = todos.findIndex(todo => todo.id === id);

  // 任务不存在
  if (todoIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      error: {
        message: '任务不存在',
        code: 'TODO_NOT_FOUND'
      }
    };
    return;
  }

  // 部分更新：只更新提供的字段
  const updatedTodo = {
    ...todos[todoIndex],
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.completed !== undefined && { completed: updates.completed })
  };

  todos[todoIndex] = updatedTodo;
  await saveTodos(todos);

  ctx.status = 200;
  ctx.body = updatedTodo;
});

/**
 * DELETE /api/todos/:id - 删除任务
 */
router.delete('/api/todos/:id', async (ctx) => {
  const { id } = ctx.params;

  const todos = await loadTodos();
  const todoIndex = todos.findIndex(todo => todo.id === id);

  // 任务不存在
  if (todoIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      error: {
        message: '任务不存在',
        code: 'TODO_NOT_FOUND'
      }
    };
    return;
  }

  // 删除任务
  todos.splice(todoIndex, 1);
  await saveTodos(todos);

  ctx.status = 204;
});

module.exports = router;
