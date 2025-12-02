const fs = require('fs').promises;
const path = require('path');

const TODOS_FILE = path.join(__dirname, 'todos.json');

/**
 * 从 todos.json 读取任务列表
 * @returns {Promise<Array>} 任务列表数组
 */
async function loadTodos() {
  try {
    const data = await fs.readFile(TODOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 文件不存在或 JSON 损坏时返回空数组
    if (error.code === 'ENOENT') {
      // 文件不存在，创建空文件
      await saveTodos([]);
      return [];
    }
    
    if (error instanceof SyntaxError) {
      // JSON 损坏，记录警告并初始化为空数组
      console.warn('todos.json 文件损坏，初始化为空数组');
      await saveTodos([]);
      return [];
    }
    
    // 其他错误抛出
    throw error;
  }
}

/**
 * 将任务列表写入 todos.json
 * @param {Array} todos - 任务列表数组
 * @returns {Promise<void>}
 */
async function saveTodos(todos) {
  await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2), 'utf-8');
}

module.exports = {
  loadTodos,
  saveTodos,
  TODOS_FILE
};
