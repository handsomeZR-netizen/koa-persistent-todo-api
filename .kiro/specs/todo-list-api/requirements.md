# 需求文档

## 简介

本文档规定了基于 Koa 框架构建的持久化 Todo List API 服务的需求。该系统提供 RESTful 端点来管理待办任务，并使用 JSON 存储实现基于文件的持久化。该服务通过将所有待办任务存储在本地 `todos.json` 文件中，确保数据在服务器重启后不会丢失。

## 术语表

- **Todo API 服务**：基于 Koa 的 Web 服务器，处理待办任务管理的 HTTP 请求
- **待办任务**：单个待办事项，包含 id、标题、完成状态和创建时间戳等属性
- **JSON 存储文件**：用于持久化数据存储的 `todos.json` 文件
- **客户端**：向 API 发起 HTTP 请求的外部应用程序或用户

## 需求

### 需求 1

**用户故事：** 作为客户端应用程序，我想要获取所有待办任务，以便向用户显示完整列表。

#### 验收标准

1. WHEN 客户端向 `/api/todos` 发送 GET 请求时，THEN Todo API 服务 SHALL 返回包含所有待办任务的 JSON 数组
2. WHEN JSON 存储文件为空或不包含任务时，THEN Todo API 服务 SHALL 返回空的 JSON 数组
3. WHEN JSON 存储文件包含多个任务时，THEN Todo API 服务 SHALL 在数组中返回所有任务
4. WHEN GET 请求成功时，THEN Todo API 服务 SHALL 响应 HTTP 状态码 200

### 需求 2

**用户故事：** 作为客户端应用程序，我想要创建新的待办任务，以便用户可以向待办列表添加项目。

#### 验收标准

1. WHEN 客户端向 `/api/todos` 发送带有有效标题的 POST 请求时，THEN Todo API 服务 SHALL 创建一个具有唯一 id 和 createdAt 时间戳的新待办任务
2. WHEN 客户端发送带有标题和 completed 字段的 POST 请求时，THEN Todo API 服务 SHALL 创建具有指定完成状态的待办任务
3. WHEN 客户端仅发送带有标题的 POST 请求时，THEN Todo API 服务 SHALL 创建 completed 默认为 false 的待办任务
4. WHEN 创建待办任务时，THEN Todo API 服务 SHALL 立即将其持久化到 JSON 存储文件
5. WHEN 待办任务成功创建时，THEN Todo API 服务 SHALL 返回创建的任务对象，HTTP 状态码为 201

### 需求 3

**用户故事：** 作为客户端应用程序，我想要更新现有的待办任务，以便用户可以修改任务详情或将任务标记为完成。

#### 验收标准

1. WHEN 客户端向 `/api/todos/:id` 发送带有有效更新数据的 POST 请求时，THEN Todo API 服务 SHALL 使用提供的字段更新匹配的待办任务
2. WHEN 客户端更新待办任务时，THEN Todo API 服务 SHALL 立即将更改持久化到 JSON 存储文件
3. WHEN 客户端发送针对不存在的 id 的更新请求时，THEN Todo API 服务 SHALL 返回 HTTP 状态码 404
4. WHEN 待办任务成功更新时，THEN Todo API 服务 SHALL 返回更新后的任务对象
5. WHEN 客户端在更新中仅提供 title 或仅提供 completed 时，THEN Todo API 服务 SHALL 仅更新提供的字段，同时保留其他字段

### 需求 4

**用户故事：** 作为客户端应用程序，我想要删除待办任务，以便用户可以移除已完成或不需要的项目。

#### 验收标准

1. WHEN 客户端针对现有任务向 `/api/todos/:id` 发送 DELETE 请求时，THEN Todo API 服务 SHALL 从存储中移除该待办任务
2. WHEN 删除待办任务时，THEN Todo API 服务 SHALL 立即将删除操作持久化到 JSON 存储文件
3. WHEN 客户端发送针对不存在的 id 的 DELETE 请求时，THEN Todo API 服务 SHALL 返回 HTTP 状态码 404
4. WHEN 待办任务成功删除时，THEN Todo API 服务 SHALL 返回 HTTP 状态码 204，不包含内容

### 需求 5

**用户故事：** 作为系统操作员，我想要待办数据在服务器重启后持久保存，以便用户在服务重启时不会丢失任务。

#### 验收标准

1. WHEN Todo API 服务启动时，THEN 系统 SHALL 从 JSON 存储文件加载现有的待办任务
2. WHEN 启动时 JSON 存储文件不存在时，THEN Todo API 服务 SHALL 创建空文件并初始化为空任务列表
3. WHEN 创建、更新或删除任何待办任务时，THEN Todo API 服务 SHALL 将完整的任务列表写入 JSON 存储文件
4. WHEN JSON 存储文件损坏或包含无效 JSON 时，THEN Todo API 服务 SHALL 优雅地处理错误并初始化为空任务列表

### 需求 6

**用户故事：** 作为开发者，我想要 API 解析 JSON 请求体，以便客户端可以以标准格式发送待办数据。

#### 验收标准

1. WHEN 客户端发送带有 JSON 请求体的 POST 请求时，THEN Todo API 服务 SHALL 解析请求体并使其可供路由处理器使用
2. WHEN 客户端发送带有无效 JSON 的请求时，THEN Todo API 服务 SHALL 返回适当的错误响应
3. WHEN 客户端发送不包含必需 title 字段的 POST 请求时，THEN Todo API 服务 SHALL 验证并拒绝该请求

### 需求 7

**用户故事：** 作为开发者，我想要服务使用适当的路由，以便可以轻松组织和维护不同的端点。

#### 验收标准

1. WHEN Todo API 服务接收到 HTTP 请求时，THEN 系统 SHALL 根据 HTTP 方法和路径将其路由到适当的处理器
2. WHEN 客户端请求未定义的路由时，THEN Todo API 服务 SHALL 返回适当的错误响应
3. WHEN 定义了多个路由时，THEN Todo API 服务 SHALL 将请求匹配到最具体的路由模式
