const fc = require('fast-check');
const fs = require('fs').promises;
const { loadTodos, saveTodos, TODOS_FILE } = require('../storage');

describe('Storage Module', () => {
  // 清理测试文件
  afterEach(async () => {
    try {
      await fs.unlink(TODOS_FILE);
    } catch (error) {
      // 文件可能不存在，忽略错误
    }
  });

  /**
   * **Feature: todo-list-api, Property 14: 服务重启后数据持久化**
   * **验证需求：5.1**
   * 
   * 对于任何保存到文件的任务列表，服务重启后加载的任务列表应该与保存前完全一致
   */
  test('Property 14: 服务重启后数据持久化', async () => {
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
          // 保存任务列表
          await saveTodos(todos);
          
          // 模拟服务重启：重新加载任务列表
          const loadedTodos = await loadTodos();
          
          // 验证加载的数据与保存的数据完全一致
          expect(loadedTodos).toEqual(todos);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('loadTodos 在文件不存在时创建空文件', async () => {
    const todos = await loadTodos();
    expect(todos).toEqual([]);
    
    // 验证文件已创建
    const fileExists = await fs.access(TODOS_FILE).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);
  });

  test('loadTodos 在 JSON 损坏时返回空数组', async () => {
    // 写入损坏的 JSON
    await fs.writeFile(TODOS_FILE, '{ invalid json }', 'utf-8');
    
    const todos = await loadTodos();
    expect(todos).toEqual([]);
  });

  test('saveTodos 正确写入任务列表', async () => {
    const testTodos = [
      {
        id: '123',
        title: '测试任务',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ];
    
    await saveTodos(testTodos);
    
    const data = await fs.readFile(TODOS_FILE, 'utf-8');
    const savedTodos = JSON.parse(data);
    
    expect(savedTodos).toEqual(testTodos);
  });
});
