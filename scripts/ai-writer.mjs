#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 配置
const CONFIG = {
  samplesDir: path.join(ROOT_DIR, 'samples'),
  outlinesFile: path.join(ROOT_DIR, 'src/data/outlines.js'),
  dataFile: path.join(ROOT_DIR, 'src/data/novels.js'),
  logFile: path.join(ROOT_DIR, 'logs/ai-writer.log'),
  
  // MiniMax API
  apiUrl: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
  
  // API重试配置
  maxRetries: 3,
  retryDelay: 2000,
  
  // 自动创建新小说的配置
  autoCreateNovel: {
    enabled: true,
    maxNovels: 10,
    minChaptersForSample: 5,
    genres: ['青春', '文艺', '爱情', '都市'],
    startChapterWords: 1500,
    // 范式约束：最少5章，上限不限，由AI按大纲而定
    paradigm: {
      requireOutline: true,        // 必须有大纲
      minOutlineChapters: 5        // 大纲至少5章，无上限
    }
  },
  
  // 完结判断配置
  completion: {
    aiEvaluation: true,           // 启用AI自主评估
    nearEndThreshold: 0.75,       // 完成75%时开始评估
    minConfidenceToComplete: 0.7  // AI置信度达到70%才完结
  },
  
  // 作者更新概率 [周一, 周二, 周三, 周四, 周五, 周六, 周日]
  authors: [
    { id: 'author1', name: '林墨', pattern: [1, 1, 1, 1, 1, 0.8, 0.6], desc: '勤奋型' },
    { id: 'author2', name: '苏小筑', pattern: [0.7, 0.5, 1, 0.3, 0.8, 0.5, 0.6], desc: '随性型' },
    { id: 'author3', name: '顾北辰', pattern: [0.2, 0.2, 0.3, 0.8, 1, 1, 0.5], desc: '爆发型' },
    { id: 'author4', name: '桕树地街', pattern: [0.8, 0.6, 0.9, 0.7, 0.8, 0.5, 0.6], desc: '文艺型' }
  ]
};

// 运行统计
const stats = {
  startTime: null,
  endTime: null,
  apiCalls: 0,
  apiRetries: 0,
  successCount: 0,
  skipCount: 0,
  errorCount: 0,
  completedNovels: [],
  newSamples: 0,
  newNovels: 0,
  aiCompletionDecisions: 0
};

// 日志级别
const LOG_LEVEL = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const currentLogLevel = LOG_LEVEL.INFO;

// 日志函数
function log(message, level = LOG_LEVEL.INFO) {
  if (level < currentLogLevel) return;
  
  const timestamp = new Date().toISOString();
  const levelStr = Object.keys(LOG_LEVEL).find(k => LOG_LEVEL[k] === level) || 'INFO';
  const logMessage = `[${timestamp}] [${levelStr}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  const logDir = path.dirname(CONFIG.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(CONFIG.logFile, logMessage);
}

const logDebug = (msg) => log(msg, LOG_LEVEL.DEBUG);
const logInfo = (msg) => log(msg, LOG_LEVEL.INFO);
const logWarn = (msg) => log(msg, LOG_LEVEL.WARN);
const logError = (msg) => log(msg, LOG_LEVEL.ERROR);

// ==================== 辅助函数 ====================

// 读取环境变量
function loadEnv() {
  const envPath = path.join(ROOT_DIR, '.env');
  if (!fs.existsSync(envPath)) {
    logError('.env file not found');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

// 读取文风样本
function loadSamples() {
  const samples = [];
  
  if (!fs.existsSync(CONFIG.samplesDir)) {
    fs.mkdirSync(CONFIG.samplesDir, { recursive: true });
    return samples;
  }
  
  const files = fs.readdirSync(CONFIG.samplesDir)
    .filter(f => f.startsWith('sample-') && f.endsWith('.txt'));
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(CONFIG.samplesDir, file), 'utf-8');
    if (content.length > 100) {
      samples.push(content);
    }
  }
  
  return samples;
}

// 保存新章节为样本
function saveChapterAsSample(novelTitle, chapterTitle, content) {
  if (!content || content.length < 200) return;
  
  const timestamp = Date.now();
  const filename = `sample-gen-${timestamp}.txt`;
  const filepath = path.join(CONFIG.samplesDir, filename);
  
  const sampleContent = `【${novelTitle} - ${chapterTitle}】\n\n${content}`;
  
  fs.writeFileSync(filepath, sampleContent, 'utf-8');
  stats.newSamples++;
  logDebug(`Saved sample: ${filename}`);
}

// 读取大纲数据
async function loadOutlines() {
  const tempModulePath = path.join(ROOT_DIR, 'temp-outlines-module.mjs');
  
  try {
    if (!fs.existsSync(CONFIG.outlinesFile)) {
      return { outlines: {}, getNextChapterPlan: () => null, isNovelComplete: () => false };
    }
    
    const originalContent = fs.readFileSync(CONFIG.outlinesFile, 'utf-8');
    fs.writeFileSync(tempModulePath, originalContent);
    
    const dataModule = await import('file://' + tempModulePath.replace(/\\/g, '/'));
    
    return {
      outlines: dataModule.outlines || {},
      getNextChapterPlan: dataModule.getNextChapterPlan,
      getCurrentPhase: dataModule.getCurrentPhase,
      isNovelComplete: dataModule.isNovelComplete
    };
  } finally {
    if (fs.existsSync(tempModulePath)) {
      fs.unlinkSync(tempModulePath);
    }
  }
}

// 验证大纲有效性（灵活验证）
function validateOutline(outline) {
  const { paradigm } = CONFIG.autoCreateNovel;
  
  if (!outline) {
    return { valid: false, reason: '大纲不存在' };
  }
  
  if (!outline.totalChapters || outline.totalChapters < 1) {
    return { valid: false, reason: '缺少有效的totalChapters字段' };
  }
  
  // 最少5章，无上限
  if (outline.totalChapters < paradigm.minOutlineChapters) {
    return { valid: false, reason: `章节数不足（${outline.totalChapters} < ${paradigm.minOutlineChapters}）` };
  }
  
  if (!outline.phases || typeof outline.phases !== 'object') {
    return { valid: false, reason: '缺少phases字段' };
  }
  
  // 灵活验证：只要phases有内容且有chapters_plan即可
  const phaseKeys = Object.keys(outline.phases);
  if (phaseKeys.length === 0) {
    return { valid: false, reason: '没有任何阶段规划' };
  }
  
  let totalPlannedChapters = 0;
  for (const phase of Object.values(outline.phases)) {
    if (phase.chapters_plan && phase.chapters_plan.length > 0) {
      totalPlannedChapters += phase.chapters_plan.length;
    }
  }
  
  if (totalPlannedChapters < paradigm.minOutlineChapters) {
    return { valid: false, reason: `规划章节数不足（${totalPlannedChapters} < ${paradigm.minOutlineChapters}）` };
  }
  
  return { valid: true };
}

// 保存大纲数据
function saveOutlines(outlines) {
  const content = `/**
 * 小说大纲数据（自动生成）
 */

export const outlines = ${JSON.stringify(outlines, null, 2)};

// 获取小说大纲
export function getOutline(novelId) {
  return outlines[novelId] || null;
}

// 获取下一章的规划
export function getNextChapterPlan(novelId, currentChapterCount) {
  const outline = outlines[novelId];
  if (!outline) return null;
  
  const nextChapterNumber = currentChapterCount + 1;
  
  for (const phase of Object.values(outline.phases)) {
    for (const plan of phase.chapters_plan) {
      if (plan.number === nextChapterNumber) {
        return {
          ...plan,
          phase: phase.name,
          phaseGoal: phase.goal
        };
      }
    }
  }
  
  return null;
}

// 获取小说当前阶段
export function getCurrentPhase(novelId, currentChapterCount) {
  const outline = outlines[novelId];
  if (!outline) return null;
  
  for (const [key, phase] of Object.entries(outline.phases)) {
    if (phase.chapters_plan) {
      const hasChapter = phase.chapters_plan.some(p => p.number === currentChapterCount);
      if (hasChapter) {
        return { key, ...phase };
      }
    }
  }
  
  return null;
}

// 检查小说是否已完成
export function isNovelComplete(novelId, currentChapterCount) {
  const outline = outlines[novelId];
  if (!outline) return false;
  
  return currentChapterCount >= outline.totalChapters;
}
`;
  
  fs.writeFileSync(CONFIG.outlinesFile, content, 'utf-8');
}

// 从小说数据中读取样本
async function loadNovelSamples() {
  const data = await loadNovelsData();
  const novelSamples = [];
  
  for (const novel of data.novels) {
    if (novel.status !== '连载中' && novel.status !== '已完结') continue;
    
    const novelChapters = data.chapters[novel.id] || [];
    if (novelChapters.length > 0) {
      const recentChapters = novelChapters.slice(-3);
      for (const chapter of recentChapters) {
        if (chapter.content && chapter.content.length > 200) {
          novelSamples.push({
            title: novel.title,
            chapter: chapter.title,
            content: chapter.content
          });
        }
      }
    }
  }
  
  return novelSamples;
}

// 读取小说数据
async function loadNovelsData() {
  const tempModulePath = path.join(ROOT_DIR, 'temp-data-module.mjs');
  
  try {
    const originalContent = fs.readFileSync(CONFIG.dataFile, 'utf-8');
    fs.writeFileSync(tempModulePath, originalContent);
    
    const dataModule = await import('file://' + tempModulePath.replace(/\\/g, '/'));
    
    return {
      novels: dataModule.novels || [],
      chapters: dataModule.chapters || {},
      authors: dataModule.authors || [],
      genres: dataModule.genres || []
    };
  } finally {
    if (fs.existsSync(tempModulePath)) {
      fs.unlinkSync(tempModulePath);
    }
  }
}

// 保存小说数据
function saveNovelsData(data) {
  const content = `export const authors = ${JSON.stringify(data.authors, null, 2)};

export const novels = ${JSON.stringify(data.novels, null, 2)};

export const chapters = ${JSON.stringify(data.chapters, null, 2)};

export const genres = ${JSON.stringify(data.genres, null, 2)};

export function getNovelById(id) {
  return novels.find(n => n.id === id) || null;
}

export function getChaptersByNovelId(novelId) {
  return chapters[novelId] || [];
}

export function getAuthorById(id) {
  return authors.find(a => a.id === id) || null;
}

export function getNovelsByGenre(genre) {
  return novels.filter(n => n.genre === genre);
}

export function getLatestNovels(limit = 10) {
  return [...novels].sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate)).slice(0, limit);
}
`;
  
  fs.writeFileSync(CONFIG.dataFile, content, 'utf-8');
}

// 检查今日是否应该更新
function shouldUpdateToday(author) {
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1;
  const probability = author.pattern[dayIndex];
  return Math.random() < probability;
}

// ==================== API调用 ====================

// 调用MiniMax API（带重试）
async function callMiniMaxAPI(env, systemPrompt, userPrompt) {
  let lastError;
  
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    stats.apiCalls++;
    
    try {
      logDebug(`API call attempt ${attempt}/${CONFIG.maxRetries}`);
      
      const response = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.MINIMAX_API_KEY}`
        },
        body: JSON.stringify({
          model: env.MINIMAX_MODEL || 'abab6.5s-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.8,
          max_tokens: 4000
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || null;
      
      if (!content) {
        throw new Error('Empty response from API');
      }
      
      return content;
    } catch (error) {
      lastError = error;
      stats.apiRetries++;
      logWarn(`API call failed (attempt ${attempt}/${CONFIG.maxRetries}): ${error.message}`);
      
      if (attempt < CONFIG.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
      }
    }
  }
  
  throw lastError;
}

// ==================== 核心功能 ====================

// AI自主评估是否应该完结
async function evaluateCompletion(env, novel, chapters, outline) {
  if (!CONFIG.completion.aiEvaluation) {
    return { shouldComplete: false, reason: 'AI评估已禁用' };
  }
  
  const progress = chapters.length / outline.totalChapters;
  
  // 如果还没到阈值，不评估
  if (progress < CONFIG.completion.nearEndThreshold) {
    return { shouldComplete: false, reason: `进度不足（${(progress * 100).toFixed(1)}% < ${CONFIG.completion.nearEndThreshold * 100}%）` };
  }
  
  logInfo(`Evaluating completion for ${novel.title} (${(progress * 100).toFixed(1)}% complete)`);
  
  // 获取当前阶段
  const currentPhase = outline.phases.resolution || outline.phases.climax;
  
  // 构建前文摘要
  const recentChapters = chapters.slice(-3);
  const summaryText = recentChapters
    .map(c => `第${c.number}章 ${c.title}: ${c.content.substring(0, 200)}...`)
    .join('\n');
  
  const systemPrompt = `你是一位专业的小说编辑，负责判断小说是否可以自然完结。`;

  const userPrompt = `【小说信息】
标题：${novel.title}
类型：${novel.genre}
大纲总章数：${outline.totalChapters}
已写章数：${chapters.length}

【故事大纲目标】
${outline.theme || '未设置'}

【最近章节摘要】
${summaryText}

【当前阶段目标】
${currentPhase?.goal || '未设置'}

请评估这部小说是否可以在此处自然完结，输出以下JSON格式：
{
  "shouldComplete": true/false,
  "confidence": 0.0-1.0,
  "reason": "评估理由",
  "suggestions": "如果不能完结，建议如何处理"
}

评估标准：
1. 主要情节是否已经解决
2. 人物弧光是否完成
3. 情感是否达到高潮或收尾
4. 与大纲目标的契合度
5. 是否还有未解决的重要悬念`;

  try {
    const response = await callMiniMaxAPI(env, systemPrompt, userPrompt);
    
    // 解析JSON
    const jsonMatch = response.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      stats.aiCompletionDecisions++;
      
      logInfo(`AI Evaluation: shouldComplete=${result.shouldComplete}, confidence=${result.confidence}`);
      logInfo(`Reason: ${result.reason}`);
      
      return result;
    }
  } catch (error) {
    logWarn(`Failed to parse AI evaluation: ${error.message}`);
  }
  
  // 默认不完结
  return { shouldComplete: false, confidence: 0, reason: '评估失败' };
}

// 按大纲生成新章节
async function generateChapter(env, novel, samples, previousChapters, chapterPlan, outline, novelSamples = []) {
  const allSamples = [...samples];
  for (const sample of novelSamples) {
    allSamples.push(`【${sample.title} - ${sample.chapter}】\n${sample.content}`);
  }
  
  const styleText = allSamples.slice(-10).join('\n\n---\n\n');
  
  const previousText = previousChapters
    .map(c => `第${c.number}章 ${c.title}\n${c.content.substring(0, 300)}...`)
    .join('\n\n');

  const totalChapters = outline?.totalChapters || '?';
  const currentChapter = chapterPlan.number;
  const progress = outline?.totalChapters ? `（进度：${currentChapter}/${totalChapters}）` : '';

  const systemPrompt = `你是一位经验丰富的小说作家。请仔细阅读以下样本文本，学习其写作风格特点：

【样本文本】
${styleText}

【写作风格要点】
- 模仿样本的叙事风格和节奏
- 保持相似的语言特点
- 注意细节描写和情感表达
- 每章要有完整的段落结构`;

  const isLastChapter = outline?.totalChapters ? currentChapter >= outline.totalChapters : false;
  
  const userPrompt = `【小说信息】
标题：${novel.title}
类型：${novel.genre}
主题：${novel.intro}

【章节进度】${progress}
当前正在写：第${currentChapter}章（共${totalChapters}章）
${isLastChapter ? '【重要】这是最后一章，请为故事画上圆满的句号！' : `距离完结还有 ${outline?.totalChapters ? outline.totalChapters - currentChapter : '?'} 章`}

【本章规划】（必须严格遵循）
章节号：第${chapterPlan.number}章
章节标题：${chapterPlan.title}
核心情节：${chapterPlan.core_plot}
情感基调：${chapterPlan.emotion}
关键元素：${(chapterPlan.key_elements || []).join('、')}
当前阶段：${chapterPlan.phase || '未定'}（${chapterPlan.phaseGoal || '推进剧情'}）

【前情提要】
${previousText || '（这是第一章）'}

请撰写第${chapterPlan.number}章，要求：
1. 严格按照本章规划的核心情节展开
2. 情感基调符合规划要求
3. 自然融入关键元素
4. 与前文情节自然衔接
5. 字数控制在 1200-1800 字
6. 输出格式：先输出"第${chapterPlan.number}章 ${chapterPlan.title}"，然后是正文
7. 正文使用自然段落分隔`;

  return await callMiniMaxAPI(env, systemPrompt, userPrompt);
}

// AI自主创建新小说
async function createNewNovel(env, samples, existingData) {
  logInfo('=== Creating New Novel ===');
  
  const novelSamples = await loadNovelSamples();
  const allSamples = [...samples, ...novelSamples.map(s => `【${s.title} - ${s.chapter}】\n${s.content}`)];
  const styleText = allSamples.slice(-15).join('\n\n---\n\n');
  
  const genre = CONFIG.autoCreateNovel.genres[Math.floor(Math.random() * CONFIG.autoCreateNovel.genres.length)];
  
  const systemPrompt = `你是一位经验丰富的小说作家。请仔细阅读以下样本文本，学习其写作风格特点：

【样本文本】
${styleText}

你必须完全模仿上述样本的写作风格。`;

  const userPrompt = `请创作一部新的小说开头，要求：

【题材】${genre}

【创作要求】
1. 先输出小说信息（格式如下）：
标题：（小说标题）
类型：${genre}
简介：（2-3句话概括故事主题）
主题：（核心主题，如成长、爱情、孤独等）

2. 然后输出第一章正文
3. 第一章字数约${CONFIG.autoCreateNovel.startChapterWords}字
4. 风格要与样本文本一致
5. 要有完整的起承转合，为后续章节留下悬念
6. 正文使用自然段落分隔`;

  const generated = await callMiniMaxAPI(env, systemPrompt, userPrompt);
  
  const lines = generated.split('\n');
  let title = '未命名小说';
  let novelGenre = genre;
  let intro = '';
  let contentStart = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('标题：')) {
      title = line.replace('标题：', '').trim();
    } else if (line.startsWith('类型：')) {
      novelGenre = line.replace('类型：', '').trim();
    } else if (line.startsWith('简介：')) {
      intro = line.replace('简介：', '').trim();
    } else if (line.startsWith('主题：')) {
      intro += ' ' + line.replace('主题：', '').trim();
      contentStart = i + 1;
      break;
    }
  }
  
  const content = contentStart > 0 
    ? lines.slice(contentStart).join('\n').trim()
    : generated;
  
  const novelId = title.toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 20);
  
  if (existingData.novels.find(n => n.id === novelId)) {
    logWarn(`Novel ${novelId} already exists, skipping`);
    return null;
  }
  
  logInfo(`New Novel: ${title} (${novelGenre})`);
  
  return {
    id: novelId,
    title,
    genre: novelGenre,
    intro: intro || '这是一个充满情感的故事...',
    content,
    wordCount: content.length
  };
}

// 为新小说生成大纲（AI自主决定章节数，最少5章）
async function generateOutline(env, novelInfo) {
  const systemPrompt = `你是一位小说大纲规划专家。请为小说设计完整的故事大纲。

【范式要求】
1. 最少5章，无上限，根据故事需要自然决定章节数
2. 故事结构由你自行规划，可以是起承转合，也可以是你认为合适的任何结构
3. 每章必须有：标题、核心情节、情感基调、关键元素
4. 章节数量应与故事复杂度匹配，不要为了凑数而拖沓，也不要因篇幅而牺牲完整性`;

  const userPrompt = `请为以下小说设计完整的大纲：

【小说信息】
标题：${novelInfo.title}
类型：${novelInfo.genre}
简介：${novelInfo.intro}
第一章内容摘要：${novelInfo.content.substring(0, 500)}

【要求】
1. 由你决定总共写多少章（最少5章），根据故事情节自然规划
2. 故事阶段划分由你自行设计，可以灵活命名
3. 每章规划必须包含：number, title, core_plot, emotion, key_elements
4. 大纲必须完整，能够支撑整部小说的起承转合

请按以下JSON格式输出：
{
  "totalChapters": 你决定的章节数,
  "theme": "小说核心主题",
  "phases": {
    "phase1": {
      "name": "阶段名称",
      "goal": "阶段目标",
      "chapters_plan": [
        {"number": 1, "title": "标题", "core_plot": "情节", "emotion": "情感", "key_elements": ["元素"]},
        ...
      ]
    },
    "phase2": {
      "name": "阶段名称",
      "goal": "阶段目标",
      "chapters_plan": [...]
    }
    // 可以有任意多个阶段
  }
}`;

  const generated = await callMiniMaxAPI(env, systemPrompt, userPrompt);
  
  try {
    const jsonMatch = generated.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const outline = JSON.parse(jsonMatch[0]);
      
      // 验证大纲（灵活验证）
      const validation = validateOutline(outline);
      if (!validation.valid) {
        logWarn(`Generated outline invalid: ${validation.reason}`);
        return null;
      }
      
      return outline;
    }
  } catch (e) {
    logWarn(`Failed to parse outline JSON: ${e.message}`);
  }
  
  return null;
}

// 解析生成的内容
function parseGeneratedContent(content, chapterNumber, plannedTitle) {
  if (!content) return null;
  
  const titleMatch = content.match(/第\s*(\d+)\s*章\s+(.+?)(?:\n|$)/);
  let title = plannedTitle || `第${chapterNumber}章`;
  
  if (titleMatch) {
    title = `第${chapterNumber}章 ${titleMatch[2].trim()}`;
  }
  
  let bodyContent = content.replace(/第\s*\d+\s*章.+\n?/, '').trim();
  
  return {
    title,
    content: bodyContent,
    wordCount: bodyContent.length
  };
}

// 打印运行统计
function printStats() {
  const duration = stats.endTime ? (stats.endTime - stats.startTime) : (Date.now() - stats.startTime);
  logInfo('=== Run Statistics ===');
  logInfo(`Duration: ${(duration / 1000).toFixed(2)}s`);
  logInfo(`API Calls: ${stats.apiCalls}`);
  logInfo(`API Retries: ${stats.apiRetries}`);
  logInfo(`Success: ${stats.successCount}`);
  logInfo(`Skipped: ${stats.skipCount}`);
  logInfo(`Errors: ${stats.errorCount}`);
  logInfo(`New Samples: ${stats.newSamples}`);
  logInfo(`New Novels: ${stats.newNovels}`);
  logInfo(`AI Completion Decisions: ${stats.aiCompletionDecisions}`);
  if (stats.completedNovels.length > 0) {
    logInfo(`Completed: ${stats.completedNovels.join(', ')}`);
  }
}

// ==================== 主函数 ====================

async function main() {
  stats.startTime = Date.now();
  logInfo('=== AI Writer Started ===');
  
  const env = loadEnv();
  const samples = loadSamples();
  logInfo(`Loaded ${samples.length} style samples`);
  
  // 加载大纲
  const { outlines, getNextChapterPlan, getCurrentPhase, isNovelComplete } = await loadOutlines();
  logInfo(`Loaded outlines for ${Object.keys(outlines).length} novels`);
  
  const data = await loadNovelsData();
  logInfo(`Loaded ${data.novels.length} novels from data file`);
  
  const novelSamples = await loadNovelSamples();
  logInfo(`Loaded ${novelSamples.length} novel samples`);
  
  let outlinesModified = false;
  
  // 更新现有小说
  for (const novel of data.novels) {
    if (novel.status === '已完结') {
      logDebug(`SKIP: ${novel.title} - completed`);
      stats.skipCount++;
      continue;
    }
    
    if (novel.status !== '连载中') {
      logDebug(`SKIP: ${novel.title} - status: ${novel.status}`);
      stats.skipCount++;
      continue;
    }
    
    // 检查是否有大纲
    const outline = outlines[novel.id];
    if (!outline) {
      logWarn(`SKIP: ${novel.title} - no outline found`);
      stats.skipCount++;
      continue;
    }
    
    const novelChapters = data.chapters[novel.id] || [];
    
    // 检查是否已完成（基于章节数）
    if (isNovelComplete(novel.id, novelChapters.length)) {
      logInfo(`COMPLETE: ${novel.title} (${outline.totalChapters} chapters by count)`);
      novel.status = '已完结';
      novel.completedAt = new Date().toISOString().split('T')[0];
      stats.completedNovels.push(novel.title);
      continue;
    }
    
    // AI自主评估是否应该完结
    if (CONFIG.completion.aiEvaluation) {
      const evaluation = await evaluateCompletion(env, novel, novelChapters, outline);
      
      if (evaluation.shouldComplete && evaluation.confidence >= CONFIG.completion.minConfidenceToComplete) {
        logInfo(`AI DECISION: Completing ${novel.title} (confidence: ${evaluation.confidence})`);
        logInfo(`Reason: ${evaluation.reason}`);
        novel.status = '已完结';
        novel.completedAt = new Date().toISOString().split('T')[0];
        novel.completionReason = evaluation.reason;
        stats.completedNovels.push(novel.title);
        continue;
      }
    }
    
    // 获取作者信息
    const author = data.authors.find(a => a.id === novel.authorId);
    if (!author) {
      logWarn(`SKIP: ${novel.title} - author not found`);
      stats.skipCount++;
      continue;
    }
    
    // 检查今日是否应该更新
    if (!shouldUpdateToday(author)) {
      logInfo(`SKIP: ${novel.title} - ${author.name} not updating today`);
      stats.skipCount++;
      continue;
    }
    
    // 获取下一章规划
    const chapterPlan = getNextChapterPlan(novel.id, novelChapters.length);
    if (!chapterPlan) {
      logWarn(`SKIP: ${novel.title} - no plan for chapter ${novelChapters.length + 1}`);
      stats.skipCount++;
      continue;
    }
    
    logInfo(`UPDATE: ${novel.title} by ${author.name}`);
    logInfo(`Plan: Ch${chapterPlan.number} - ${chapterPlan.title} (${chapterPlan.phase})`);
    
    try {
      const generated = await generateChapter(env, novel, samples, novelChapters, chapterPlan, outline, novelSamples);
      const parsed = parseGeneratedContent(generated, chapterPlan.number, chapterPlan.title);
      
      if (parsed && parsed.content) {
        const newChapter = {
          id: `c-${Date.now()}`,
          novelId: novel.id,
          number: chapterPlan.number,
          title: parsed.title,
          content: parsed.content,
          wordCount: parsed.wordCount,
          publishedAt: new Date().toISOString().split('T')[0]
        };
        
        if (!data.chapters[novel.id]) {
          data.chapters[novel.id] = [];
        }
        data.chapters[novel.id].push(newChapter);
        
        novel.totalChapters = data.chapters[novel.id].length;
        novel.lastUpdate = new Date().toISOString().split('T')[0];
        
        // 保存为样本
        saveChapterAsSample(novel.title, parsed.title, parsed.content);
        
        // 检查是否完成
        if (isNovelComplete(novel.id, novel.totalChapters)) {
          novel.status = '已完结';
          novel.completedAt = new Date().toISOString().split('T')[0];
          stats.completedNovels.push(novel.title);
          logInfo(`NOVEL COMPLETE: ${novel.title}`);
        }
        
        logInfo(`SUCCESS: ${parsed.title} (${parsed.wordCount} words)`);
        stats.successCount++;
      } else {
        logError(`Failed to parse content for ${novel.title}`);
        stats.errorCount++;
      }
    } catch (error) {
      logError(`${novel.title} - ${error.message}`);
      stats.errorCount++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 自动创建新小说（带范式约束）
  if (CONFIG.autoCreateNovel.enabled && data.novels.length < CONFIG.autoCreateNovel.maxNovels) {
    const totalSampleChapters = data.novels.reduce((sum, n) => sum + (data.chapters[n.id]?.length || 0), 0);
    
    if (totalSampleChapters >= CONFIG.autoCreateNovel.minChaptersForSample) {
      if (Math.random() < 0.3) {
        logInfo('=== Attempting to create new novel ===');
        
        try {
          const newNovel = await createNewNovel(env, samples, data);
          
          if (newNovel) {
            // 生成大纲（范式约束：必须有大纲）
            const outline = await generateOutline(env, newNovel);
            
            // 验证大纲有效性
            if (CONFIG.autoCreateNovel.paradigm.requireOutline && !outline) {
              logWarn(`Cannot create novel: outline generation failed`);
            } else {
              const validation = validateOutline(outline);
              if (!validation.valid) {
                logWarn(`Cannot create novel: ${validation.reason}`);
              } else {
                // 添加到数据
                const author = data.authors[Math.floor(Math.random() * data.authors.length)];
                
                data.novels.push({
                  id: newNovel.id,
                  title: newNovel.title,
                  intro: newNovel.intro,
                  genre: newNovel.genre,
                  authorId: author.id,
                  authorName: author.name,
                  status: '连载中',
                  totalChapters: 1,
                  lastUpdate: new Date().toISOString().split('T')[0],
                  tags: [newNovel.genre, '文艺', 'AI创作'],
                  createdAt: new Date().toISOString().split('T')[0]
                });
            
            data.chapters[newNovel.id] = [{
              id: `${newNovel.id}-c-1`,
              novelId: newNovel.id,
              number: 1,
              title: '第一章',
              content: newNovel.content,
              wordCount: newNovel.wordCount,
              publishedAt: new Date().toISOString().split('T')[0]
            }];
            
            // 保存大纲
            outlines[newNovel.id] = {
              title: newNovel.title,
              theme: newNovel.intro,
              mainCharacters: [],
              ...outline
            };
            outlinesModified = true;
            
            // 保存为样本
            saveChapterAsSample(newNovel.title, '第一章', newNovel.content);
            
            stats.newNovels++;
            logInfo(`NEW NOVEL CREATED: ${newNovel.title} (${newNovel.genre})`);
            logInfo(`Outline: ${outline.totalChapters} chapters planned`);
              }
            }
          }
        } catch (error) {
          logError(`Failed to create new novel: ${error.message}`);
        }
      }
    }
  }
  
  // 保存数据
  if (stats.successCount > 0 || stats.completedNovels.length > 0 || stats.newNovels > 0) {
    saveNovelsData(data);
    logInfo('Saved novels data');
  }
  
  if (outlinesModified) {
    saveOutlines(outlines);
    logInfo('Saved outlines data');
  }
  
  // Git push to GitHub
  if (stats.successCount > 0 || stats.completedNovels.length > 0 || stats.newNovels > 0) {
    try {
      const { execSync } = await import('child_process');
      const gitRemote = 'https://github.com/waterundman/myblog.git';
      
      // Check if remote exists, add if not
      try {
        execSync('git remote get-url origin', { cwd: ROOT_DIR, stdio: 'pipe' });
      } catch {
        execSync(`git remote add origin ${gitRemote}`, { cwd: ROOT_DIR });
        logInfo(`Added git remote: ${gitRemote}`);
      }
      
      execSync('git add -A', { cwd: ROOT_DIR });
      execSync(`git commit -m "AI auto-update: ${stats.successCount} chapters, ${stats.newNovels} new novels"`, { cwd: ROOT_DIR });
      execSync('git push -u origin main', { cwd: ROOT_DIR });
      logInfo('Git push completed successfully');
    } catch (error) {
      logWarn(`Git push failed: ${error.message}`);
    }
  }
  
  stats.endTime = Date.now();
  printStats();
  logInfo('=== AI Writer Finished ===');
}

main().catch(error => {
  logError(`FATAL: ${error.message}`);
  stats.endTime = Date.now();
  printStats();
  process.exit(1);
});
