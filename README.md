# Koa Persistent Todo Api

<!-- PORTFOLIO-SNAPSHOT:START -->
<p align="left">
  <img src="https://img.shields.io/badge/category-Backend%20API%20service-blue" alt="Category" />
  <img src="https://img.shields.io/badge/status-Public%20portfolio%20artifact-2ea44f" alt="Status" />
</p>

> Persistent Todo API service built with Koa, filesystem storage, Swagger docs, Docker packaging, tests, and GitHub Actions.

## Project Snapshot

- Category: Backend API service
- Stack: JavaScript, docker, javascript, koa, nodejs, rest-api
- Status: Public portfolio artifact

## What This Demonstrates

- Presents the project with a clear purpose, technology stack, and review path.
- Demonstrates frontend delivery, deployment awareness, and user-facing product structure.
- Keeps implementation details and usage notes close to the code for easier reuse.

## Quick Start

```bash
npm install && npm run build
```

<!-- PORTFOLIO-SNAPSHOT:END -->

## Original Documentation

![Build Status](https://github.com/handsomeZR-netizen/koa-persistent-todo-api/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-ISC-blue)

> 基于 Koa 框架的持久化 Todo List RESTful API 服务，支持完整的 CRUD 操作。

## 🏗️ 项目架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Client                                │
│                    (Postman/Browser)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Request
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      app.js                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Koa Application                         │    │
│  │  • Error Handler Middleware                          │    │
│  │  • Body Parser Middleware                            │    │
│  └─────────────────────┬───────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     routes.js                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Koa Router                              │    │
│  │  • GET    /api/todos      → 获取所有任务             │    │
│  │  • POST   /api/todos      → 创建新任务               │    │
│  │  • POST   /api/todos/:id  → 更新任务                 │    │
│  │  • DELETE /api/todos/:id  → 删除任务                 │    │
│  └─────────────────────┬───────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    storage.js                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Storage Layer                              │    │
│  │  • loadTodos()  → 读取 JSON 文件                     │    │
│  │  • saveTodos()  → 写入 JSON 文件                     │    │
│  └─────────────────────┬───────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    todos.json                                │
│                  (File System)                               │
└─────────────────────────────────────────────────────────────┘
```

## 📸 使用截图

<div align="center">
  <img src="img/屏幕截图 2025-12-02 134923.png" alt="API 测试截图" width="600"/>
  <p><em>API 接口测试</em></p>
</div>

<div align="center">
  <img src="img/屏幕截图 2025-12-02 135003.png" alt="Swagger UI 截图" width="600"/>
  <p><em>Swagger UI 交互式文档</em></p>
</div>

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 启动服务
```bash
# 生产模式
npm start

# 开发模式 (热重载)
npm run dev
```

服务默认运行在 `http://localhost:3000`

### Docker 部署
```bash
# 构建镜像
docker build -t todo-api .

# 运行容器
docker run -p 3000:3000 todo-api
```

## 📖 API 文档

### 交互式文档
启动服务后访问 `/swagger` 查看 Swagger UI 交互式文档。

### API 接口列表

| Method | URL | Description | Request Body | Response |
|--------|-----|-------------|--------------|----------|
| `GET` | `/api/todos` | 获取所有任务 | - | `Todo[]` |
| `POST` | `/api/todos` | 创建新任务 | `{ title: string, completed?: boolean }` | `Todo` |
| `POST` | `/api/todos/:id` | 更新任务 | `{ title?: string, completed?: boolean }` | `Todo` |
| `DELETE` | `/api/todos/:id` | 删除任务 | - | `204 No Content` |

### 数据模型

#### Todo 对象
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "学习 Koa 框架",
  "completed": false,
  "createdAt": "2025-12-02T10:30:00.000Z"
}
```

### 请求/响应示例

#### 创建任务
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "完成作业", "completed": false}'
```

响应 `201 Created`:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "完成作业",
  "completed": false,
  "createdAt": "2025-12-02T10:30:00.000Z"
}
```

#### 错误响应
```json
{
  "error": {
    "message": "title 字段是必需的且必须是非空字符串",
    "code": "INVALID_TITLE"
  }
}
```

## 🧪 测试

```bash
# 运行测试
npm test

# 生成覆盖率报告
npm run test:cov

# 代码检查
npm run lint
```

## 📁 项目结构

```
todo-list-api/
├── app.js              # 应用入口，Koa 实例配置
├── routes.js           # API 路由定义
├── storage.js          # 数据持久化层
├── todos.json          # 数据存储文件
├── package.json        # 项目配置
├── Dockerfile          # Docker 配置
├── .github/
│   └── workflows/
│       └── ci.yml      # GitHub Actions CI 配置
└── tests/
    ├── routes.test.js  # 路由测试
    └── storage.test.js # 存储层测试
```

## 🛠️ 技术栈

- **框架**: Koa 2.x
- **路由**: koa-router
- **测试**: Jest + Supertest + fast-check (属性测试)
- **文档**: Swagger UI
- **容器化**: Docker

## 📝 License

ISC
