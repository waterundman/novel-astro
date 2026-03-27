#!/usr/bin/env node

/**
 * Cron定时任务运行器
 * 
 * 使用方法:
 *   node scripts/cron-runner.mjs [task-name]
 * 
 * 可用任务:
 *   ai-writer     - AI小说自动更新
 *   novel-processor - 处理新的小说开头文件
 *   all           - 运行所有任务
 * 
 * Cron表达式示例 (每天上午10点运行):
 *   0 10 * * * node /path/to/scripts/cron-runner.mjs ai-writer
 * 
 * Crontab配置示例:
 *   # 每天上午10点运行AI Writer
 *   0 10 * * * cd /path/to/project && node scripts/cron-runner.mjs ai-writer >> logs/cron.log 2>&1
 *   
 *   # 每周一上午9点运行Novel Processor
 *   0 9 * * 1 cd /path/to/project && node scripts/cron-runner.mjs novel-processor >> logs/cron.log 2>&1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 配置
const CONFIG = {
  logFile: path.join(ROOT_DIR, 'logs/cron.log'),
  tasks: {
    'ai-writer': {
      script: 'scripts/ai-writer.mjs',
      description: 'AI小说自动更新',
      schedule: '0 10 * * *', // 每天上午10点
      timeout: 300000 // 5分钟超时
    },
    'novel-processor': {
      script: 'scripts/novel-processor.mjs',
      description: '处理新的小说开头文件',
      schedule: '0 9 * * 1', // 每周一上午9点
      timeout: 600000 // 10分钟超时
    }
  }
};

// 日志
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [CRON] ${message}\n`;
  
  console.log(logMessage.trim());
  
  const logDir = path.dirname(CONFIG.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(CONFIG.logFile, logMessage);
}

// 运行任务
async function runTask(taskName) {
  const task = CONFIG.tasks[taskName];
  
  if (!task) {
    log(`ERROR: Unknown task: ${taskName}`);
    log(`Available tasks: ${Object.keys(CONFIG.tasks).join(', ')}`);
    process.exit(1);
  }
  
  log(`Starting task: ${taskName} - ${task.description}`);
  
  const scriptPath = path.join(ROOT_DIR, task.script);
  
  if (!fs.existsSync(scriptPath)) {
    log(`ERROR: Script not found: ${scriptPath}`);
    process.exit(1);
  }
  
  const startTime = Date.now();
  
  try {
    execSync(`node "${scriptPath}"`, {
      cwd: ROOT_DIR,
      timeout: task.timeout,
      stdio: 'inherit'
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`Task completed: ${taskName} (${duration}s)`);
    
    return { success: true, duration };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`Task failed: ${taskName} (${duration}s) - ${error.message}`);
    
    return { success: false, duration, error: error.message };
  }
}

// 显示帮助
function showHelp() {
  console.log(`
Cron定时任务运行器

使用方法:
  node scripts/cron-runner.mjs [task-name]

可用任务:
  ai-writer         AI小说自动更新 (每天上午10点)
  novel-processor   处理新的小说开头文件 (每周一上午9点)
  all               运行所有任务
  help              显示此帮助信息

Crontab配置示例:
  # 每天上午10点运行AI Writer
  0 10 * * * cd ${ROOT_DIR} && node scripts/cron-runner.mjs ai-writer >> logs/cron.log 2>&1
  
  # 每周一上午9点运行Novel Processor
  0 9 * * 1 cd ${ROOT_DIR} && node scripts/cron-runner.mjs novel-processor >> logs/cron.log 2>&1
  `);
}

// 主函数
async function main() {
  const taskName = process.argv[2] || 'help';
  
  if (taskName === 'help') {
    showHelp();
    return;
  }
  
  log('=== Cron Runner Started ===');
  
  if (taskName === 'all') {
    for (const [name, task] of Object.entries(CONFIG.tasks)) {
      await runTask(name);
      // 任务之间等待5秒
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } else {
    await runTask(taskName);
  }
  
  log('=== Cron Runner Finished ===');
}

main().catch(error => {
  log(`FATAL: ${error.message}`);
  process.exit(1);
});
