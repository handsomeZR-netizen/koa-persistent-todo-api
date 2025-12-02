# 作业名称：打造一个持久化的 Todo List API 服务

#### 一、作业目标

1. **掌握 Koa 框架基础**：创建 Koa 实例、启动服务器、使用中间件。
2. **学会使用核心中间件**：`koa-bodyparser` 用于解析 JSON 请求体。
3. **理解 Koa 路由**：使用 `koa-router` 处理不同的 API 端点（GET, POST, PUT, DELETE）。
4. **实践数据持久化**：使用文件系统（`fs` 模块）将 Todo 列表数据保存到本地 JSON 文件中，实现重启服务器后数据不丢失。
5. **培养工程化思维**：简单的代码结构组织。

#### 二、技术栈要求

- **核心框架**：`koa`
- **路由**：`koa-router`
- **请求体解析**：`koa-bodyparser`
- **数据存储**：`fs` (文件系统模块，Node.js 内置)

#### 三、功能需求

实现一个简单的 Todo List API，支持以下功能，并将所有数据保存在一个名为 `todos.json` 的文件中。

1. **`GET /api/todos`**
   1. **功能**：获取所有的 Todo 任务。
   2. **响应**：返回一个包含所有 Todo 对象的 JSON 数组。
2. **`POST /api/todos`**
   1. **功能**：创建一个新的 Todo 任务。
   2. **请求体**：客户端需要发送一个 JSON 对象，包含 `title` (任务标题，字符串，必填) 和 `completed` (是否完成，布尔值，可选，默认为 `false`)。
   3. **响应**：返回创建成功的 Todo 对象（包含自动生成的 `id` 和 `createdAt` 时间戳），状态码为 `201 Created`。
3. **`POST /api/todos/:id`**
   1. **功能**：根据 ID 更新一个已存在的 Todo 任务。
   2. **URL 参数**：`id` 为任务的唯一标识。
   3. **请求体**：客户端发送一个 JSON 对象，可以包含 `title` 和 / 或 `completed` 字段。
   4. **响应**：返回更新后的 Todo 对象；如果未找到任务，返回 `404 Not Found`。
4. **`DELETE /api/todos/:id`**
   1. **功能**：根据 ID 删除一个 Todo 任务。
   2. **URL 参数**：`id` 为任务的唯一标识。
   3. **响应**：删除成功返回 `204 No Content`；如果未找到任务，返回 `404 Not Found`。

# 学习资料

官网：https://nodejs.org/docs/latest/api/

框架：https://modernjs.dev/zh/index.html

善用 deepwiki 和 搜索引擎