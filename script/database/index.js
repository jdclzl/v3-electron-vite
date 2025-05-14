import Database from "better-sqlite3" // 用于操作 SQLite 数据库的库
import { app, ipcMain } from "electron" // 用于 Electron 应用的全局功能
import path from "path" // 用于处理和操作文件路径的模块
import fs from "fs"
let db // 声明一个变量用来存储数据库实例

// 数据库版本
let DB_VERSION = 1 // 当前数据库版本

// 初始化数据库的函数
export function initDatabase() {
  console.log("开始初始化数据库")
  // 判断当前环境是否是开发环境
  const databasePath = path.join(app.getPath("userData"), "database")
  console.log("数据库地址:", databasePath)
  // 确保数据库文件夹存在，如果不存在则创建它
  if (!fs.existsSync(databasePath)) {
    console.log("数据库目录不存在，开始创建数据库")
    fs.mkdirSync(databasePath, { recursive: true })
  }
  console.log("数据库目录创建完毕")
  // 初始化数据库并创建或打开指定路径的 SQLite 数据库文件
  const dbfile = path.join(databasePath, "uploadfile.db")
  console.log("数据库文件：", dbfile)
  try {
    db = new Database(dbfile, {
      verbose: console.log
    })
    console.log("数据库创建成功")
  } catch (error) {
    console.error("数据库初始化失败:", error)
  }
  // 设置数据库的日志模式为 WAL（写时日志）模式，提高性能
  db.pragma("journal_mode = WAL")
  // 创建版本表
  console.log("开始创建版本表")
  try {
    createVersionTable()
    console.log("创建版本表成功")
  } catch (error) {
    console.error("创建版本表失败:", error)
  }
  // 获取当前数据库版本
  const currentVersion = getCurrentDatabaseVersion()
  console.log("当前数据库版本：", currentVersion)
  // 如果数据库版本不匹配，执行数据库更新
  if (currentVersion !== DB_VERSION) {
    updateDatabaseVersion(currentVersion)
  }
  console.log("开始创建数据表")
  // 创建表，如果表不存在则创建
  createTable()
  console.log("开始注册db_query事件")
  // 在 Electron 的主进程中注册一个 IPC 事件处理器
  ipcMain.handle("db_query", async (_, query, params = []) => {
    console.log("db_query")
    const stmt = db.prepare(query) // 准备 SQL 查询
    return stmt.all(...params) // 执行查询并返回结果
  })
  // 在应用退出时关闭数据库连接
  app.on("quit", () => {
    db.close() // 关闭数据库连接
  })
  console.log("数据库初始化完毕")
}

// 创建版本表并初始化（修复原逻辑问题）
function createVersionTable() {
  // 创建表（如果不存在）
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS version (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `
  db.prepare(createTableQuery).run()

  // 检查是否存在版本记录（修复原逻辑直接插入的问题）
  const checkQuery = `SELECT COUNT(*) AS count FROM version`
  const result = db.prepare(checkQuery).get()

  // 如果没有任何版本记录，插入初始版本
  if (result.count === 0) {
    const insertQuery = `INSERT INTO version (version) VALUES (?)`
    db.prepare(insertQuery).run(1) // 初始版本设为1
    console.log("初始化版本表，插入版本 1")
  }
}

// 获取当前数据库版本（从版本表查询最新版本）
function getCurrentDatabaseVersion() {
  try {
    // 获取最大版本号（兼容多次升级的情况）
    const query = `
      SELECT MAX(version) AS current_version 
      FROM version
    `
    const result = db.prepare(query).get()
    return result.current_version || 0 // 处理无记录情况
  } catch (error) {
    console.error("获取数据库版本失败:", error)
    // 如果版本表不存在返回0（兼容首次初始化）
    return 0
  }
}

// 更新数据库版本（升级时调用）
function updateDatabaseVersion(newVersion) {
  try {
    const query = `INSERT INTO version (version) VALUES (?)`
    db.prepare(query).run(newVersion)
    console.log(`数据库版本更新为: ${newVersion}`)
    DB_VERSION = newVersion
  } catch (error) {
    console.error("版本更新失败:", error)
    throw error // 抛出异常供上层处理
  }
}

// 创建任务列表表
function createTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todo_list (
      user_id_role TEXT,
      todo_id TEXT UNIQUE,
      task_title TEXT,
      task_description TEXT,
      priority INTEGER,
      due_date TEXT,
      status TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      id INTEGER PRIMARY KEY AUTOINCREMENT
    );
  `

  // 执行创建表的 SQL 语句
  db.prepare(createTableQuery).run()
}
