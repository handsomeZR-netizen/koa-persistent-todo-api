const request = require('supertest');
const fc = require('fast-check');
const app = require('../app');
const { loadTodos, saveTodos, TODOS_FILE } = require('../storage');
const fs = require('fs').promises;

// 清理测试文件
afterEach(async () => {
  try {
    await fs.unlink(TODOS_FILE);
  } catch (error) {
    // 文件不存在时忽略错误
  }
});

describe('GET /api/todos 端点', () => {
  /**
   * **Feature: todo-list-api, Property 1: 获取所有任务返回完整列表**
   * **验证需求：1.1, 1.3, 1.4**
   * 
   * 对于任何待办任务列表，当调用 GET /api/todos 时，
   * 返回的 JSON 数组应该包含存储中的所有任务，且响应状态码为 200
   */
  test('属性 1：获取所有任务返回完整列表', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            completed: fc.boolean(),
            createdAt: fc.date().map(d => d.toISOString())
          })
        ),
        async (todos) => {
          // 保存任务列表到存储
          await saveTodos(todos);

          // 调用 GET 端点
          const response = await request(app.callback())
            .get('/api/todos')
            .expect(200);

          // 验证返回的任务列表与存储的一致
          expect(response.body).toEqual(todos);
          expect(response.body.length).toBe(todos.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('空列表时返回空数组', async () => {
    await saveTodos([]);

    const response = await request(app.callback())
      .get('/api/todos')
      .expect(200);

    expect(response.body).toEqual([]);
  });
});

describe('POST /api/todos 端点', () => {
  /**
   * **Feature: todo-list-api, Property 2: 创建任务生成必需字段**
   * **验证需求：2.1**
   * 
   * 对于任何有效的任务标题，当创建新任务时，
   * 返回的任务对象应该包含唯一的 id 和 createdAt 时间戳
   */
  test('属性 2：创建任务生成必需字段', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (title) => {
          await saveTodos([]);

          const response = await request(app.callback())
            .post('/api/todos')
            .send({ title })
            .expect(201);

          const todo = response.body;
          
          // 验证必需字段存在
          expect(todo).toHaveProperty('id');
          expect(todo).toHaveProperty('createdAt');
          expect(todo.id).toBeTruthy();
          expect(todo.createdAt).toBeTruthy();
          
          // 验证 id 是有效的 UUID
          expect(todo.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
          
          // 验证 createdAt 是有效的 ISO 8601 时间戳
          expect(new Date(todo.createdAt).toISOString()).toBe(todo.createdAt);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: todo-list-api, Property 3: 创建任务保留 completed 状态**
   * **验证需求：2.2**
   * 
   * 对于任何提供的 completed 值（true 或 false），
   * 创建任务时应该保留该值
   */
  test('属性 3：创建任务保留 completed 状态', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        async (title, completed) => {
          await saveTodos([]);

          const response = await request(app.callback())
            .post('/api/todos')
            .send({ title, completed })
            .expect(201);

          expect(response.body.completed).toBe(completed);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: todo-list-api, Property 4: 创建任务的持久化往返**
   * **验证需求：2.4**
   * 
   * 对于任何创建的任务，立即从 JSON 存储文件读取应该能获取到相同的任务数据
   */
  test('属性 4：创建任务的持久化往返', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        async (title, completed) => {
          await saveTodos([]);

          const response = await request(app.callback())
            .post('/api/todos')
            .send({ title, completed })
            .expect(201);

          const createdTodo = response.body;

          // 从存储读取
          const todos = await loadTodos();
          const foundTodo = todos.find(t => t.id === createdTodo.id);

          expect(foundTodo).toEqual(createdTodo);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: todo-list-api, Property 5: 成功创建返回 201 和任务对象**
   * **验证需求：2.5**
   * 
   * 对于任何有效的创建请求，响应状态码应该为 201，
   * 且响应体应该包含创建的任务对象
   */
  test('属性 5：成功创建返回 201 和任务对象', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (title) => {
          await saveTodos([]);

          const response = await request(app.callback())
            .post('/api/todos')
            .send({ title })
            .expect(201);

          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('title', title);
          expect(response.body).toHaveProperty('completed');
          expect(response.body).toHaveProperty('createdAt');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('默认 completed 为 false', async () => {
    await saveTodos([]);

    const response = await request(app.callback())
      .post('/api/todos')
      .send({ title: '测试任务' })
      .expect(201);

    expect(response.body.completed).toBe(false);
  });

  test('缺少 title 返回 400', async () => {
    await saveTodos([]);

    const response = await request(app.callback())
      .post('/api/todos')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});

describe('POST /api/todos/:id 端点', () => {
  /**
   * **Feature: todo-list-api, Property 6: 更新任务修改指定字段**
   * **验证需求：3.1, 3.4**
   * 
   * 对于任何现有任务和有效的更新数据，更新操作应该修改指定的字段
   */
  test('属性 6：更新任务修改指定字段', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          completed: fc.boolean(),
          createdAt: fc.date().map(d => d.toISOString())
        }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        async (originalTodo, newTitle, newCompleted) => {
          await saveTodos([originalTodo]);

          const response = await request(app.callback())
            .post(`/api/todos/${originalTodo.id}`)
            .send({ title: newTitle, completed: newCompleted })
            .expect(200);

          expect(response.body.title).toBe(newTitle);
          expect(response.body.completed).toBe(newCompleted);
          expect(response.body.id).toBe(originalTodo.id);
          expect(response.body.createdAt).toBe(originalTodo.createdAt);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: todo-list-api, Property 7: 更新任务的持久化往返**
   * **验证需求：3.2**
   * 
   * 对于任何更新的任务，立即从 JSON 存储文件读取应该能获取到更新后的数据
   */
  test('属性 7：更新任务的持久化往返', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          completed: fc.boolean(),
          createdAt: fc.date().map(d => d.toISOString())
        }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (originalTodo, newTitle) => {
          await saveTodos([originalTodo]);

          const response = await request(app.callback())
            .post(`/api/todos/${originalTodo.id}`)
            .send({ title: newTitle })
            .expect(200);

          const updatedTodo = response.body;

          // 从存储读取
          const todos = await loadTodos();
          const foundTodo = todos.find(t => t.id === originalTodo.id);

          expect(foundTodo).toEqual(updatedTodo);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: todo-list-api, Property 8: 更新不存在的任务返回 404**
   * **验证需求：3.3**
   * 
   * 对于任何不存在的任务 ID，更新请求应该返回 HTTP 状态码 404
   */
  test('属性 8：更新不存在的任务返回 404', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (nonExistentId, newTitle) => {
          await saveTodos([]);

          const response = await request(app.callback())
            .post(`/api/todos/${nonExistentId}`)
            .send({ title: newTitle })
            .expect(404);

          expect(response.body).toHaveProperty('error');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: todo-list-api, Property 9: 部分更新保留未修改字段**
   * **验证需求：3.5**
   * 
   * 对于任何现有任务，当只更新部分字段时，未提供的字段应该保持原值不变
   */
  test('属性 9：部分更新保留未修改字段', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          completed: fc.boolean(),
          createdAt: fc.date().map(d => d.toISOString())
        }),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (originalTodo, newTitle) => {
          await saveTodos([originalTodo]);

          // 只更新 title
          const response = await request(app.callback())
            .post(`/api/todos/${originalTodo.id}`)
            .send({ title: newTitle })
            .expect(200);

          expect(response.body.title).toBe(newTitle);
          expect(response.body.completed).toBe(originalTodo.completed);
          expect(response.body.id).toBe(originalTodo.id);
          expect(response.body.createdAt).toBe(originalTodo.createdAt);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('只更新 completed 保留 title', async () => {
    const todo = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: '原始标题',
      completed: false,
      createdAt: new Date().toISOString()
    };
    await saveTodos([todo]);

    const response = await request(app.callback())
      .post(`/api/todos/${todo.id}`)
      .send({ completed: true })
      .expect(200);

    expect(response.body.title).toBe(todo.title);
    expect(response.body.completed).toBe(true);
  });
});

describe('DELETE /api/todos/:id 端点', () => {
  /**
   * **Feature: todo-list-api, Property 10: 删除任务移除存储**
   * **验证需求：4.1**
   * 
   * 对于任何现有任务，删除操作后该任务不应该再出现在任务列表中
   */
  test('属性 10：删除任务移除存储', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          completed: fc.boolean(),
          createdAt: fc.date().map(d => d.toISOString())
        }),
        async (todo) => {
          await saveTodos([todo]);

          await request(app.callback())
            .delete(`/api/todos/${todo.id}`)
            .expect(204);

          // 验证任务已被删除
          const todos = await loadTodos();
          const foundTodo = todos.find(t => t.id === todo.id);
          expect(foundTodo).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: todo-list-api, Property 11: 删除任务的持久化往返**
   * **验证需求：4.2**
   * 
   * 对于任何删除的任务，立即从 JSON 存储文件读取应该确认该任务已被移除
   */
  test('属性 11：删除任务的持久化往返', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            completed: fc.boolean(),
            createdAt: fc.date().map(d => d.toISOString())
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (todos) => {
          await saveTodos(todos);

          // 删除第一个任务
          const todoToDelete = todos[0];
          await request(app.callback())
            .delete(`/api/todos/${todoToDelete.id}`)
            .expect(204);

          // 从存储读取并验证
          const remainingTodos = await loadTodos();
          expect(remainingTodos.length).toBe(todos.length - 1);
          expect(remainingTodos.find(t => t.id === todoToDelete.id)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: todo-list-api, Property 12: 删除不存在的任务返回 404**
   * **验证需求：4.3**
   * 
   * 对于任何不存在的任务 ID，删除请求应该返回 HTTP 状态码 404
   */
  test('属性 12：删除不存在的任务返回 404', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (nonExistentId) => {
          await saveTodos([]);

          const response = await request(app.callback())
            .delete(`/api/todos/${nonExistentId}`)
            .expect(404);

          expect(response.body).toHaveProperty('error');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: todo-list-api, Property 13: 成功删除返回 204**
   * **验证需求：4.4**
   * 
   * 对于任何现有任务，成功删除应该返回 HTTP 状态码 204，且响应体为空
   */
  test('属性 13：成功删除返回 204', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          completed: fc.boolean(),
          createdAt: fc.date().map(d => d.toISOString())
        }),
        async (todo) => {
          await saveTodos([todo]);

          const response = await request(app.callback())
            .delete(`/api/todos/${todo.id}`)
            .expect(204);

          expect(response.body).toEqual({});
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('输入验证', () => {
  /**
   * **Feature: todo-list-api, Property 15: JSON 请求体解析**
   * **验证需求：6.1**
   * 
   * 对于任何有效的 JSON 请求体，中间件应该正确解析并使路由处理器能够访问解析后的数据
   */
  test('属性 15：JSON 请求体解析', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.boolean(),
        async (title, completed) => {
          await saveTodos([]);

          const response = await request(app.callback())
            .post('/api/todos')
            .send({ title, completed })
            .expect(201);

          // 验证请求体被正确解析
          expect(response.body.title).toBe(title);
          expect(response.body.completed).toBe(completed);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: todo-list-api, Property 16: 缺少必需字段被拒绝**
   * **验证需求：6.3**
   * 
   * 对于任何不包含 title 字段的创建请求，系统应该拒绝该请求并返回错误响应
   */
  test('属性 16：缺少必需字段被拒绝', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          completed: fc.boolean()
        }),
        async (invalidBody) => {
          await saveTodos([]);

          const response = await request(app.callback())
            .post('/api/todos')
            .send(invalidBody)
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toHaveProperty('message');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('空字符串 title 被拒绝', async () => {
    await saveTodos([]);

    const response = await request(app.callback())
      .post('/api/todos')
      .send({ title: '' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('纯空格 title 被拒绝', async () => {
    await saveTodos([]);

    const response = await request(app.callback())
      .post('/api/todos')
      .send({ title: '   ' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
