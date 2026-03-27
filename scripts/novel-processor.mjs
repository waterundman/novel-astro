#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 配置（必须在使用前定义）
const CONFIG = {
  promptsDir: path.join(ROOT_DIR, 'prompts'),
  samplesDir: path.join(ROOT_DIR, 'samples'),
  dataFile: path.join(ROOT_DIR, 'src/data/novels.js'),
  logFile: path.join(ROOT_DIR, 'logs/novel-processor.log'),
  
  // MiniMax API
  apiUrl: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
  
  // API重试配置
  maxRetries: 3,
  retryDelay: 2000,
  
  // 章节字数目标
  targetChapterWords: 1500,
  minChapterWords: 1200,
  
  // 小说类型判定阈值
  shortStoryThreshold: 5000,
  mediumStoryThreshold: 20000
};

// 日志级别
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

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

// 调用MiniMax API（带重试）
async function callMiniMaxAPI(env, systemPrompt, userPrompt) {
  let lastError;
  
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
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
      logWarn(`API call failed (attempt ${attempt}/${CONFIG.maxRetries}): ${error.message}`);
      
      if (attempt < CONFIG.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
      }
    }
  }
  
  throw lastError;
}

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
    logWarn('Samples directory not found');
    return samples;
  }
  
  const files = fs.readdirSync(CONFIG.samplesDir)
    .filter(f => f.startsWith('sample-') && f.endsWith('.txt'));
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(CONFIG.samplesDir, file), 'utf-8');
    samples.push(content);
  }
  
  return samples;
}

// 解析小说开头文件
function parseNovelStart(content) {
  const lines = content.split('\n');
  let title = '未命名小说';
  let genre = '未知';
  let intro = '';
  let bodyStart = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('标题：')) {
      title = line.replace('标题：', '').trim();
    } else if (line.startsWith('类型：')) {
      genre = line.replace('类型：', '').trim();
    } else if (line.startsWith('简介：')) {
      intro = line.replace('简介：', '').trim();
    } else if (line.startsWith('【第一章】') || line.startsWith('正文')) {
      bodyStart = i;
      break;
    }
  }
  
  const bodyContent = bodyStart > 0 
    ? lines.slice(bodyStart).join('\n').trim()
    : content;
  
  return {
    title,
    genre,
    intro,
    content: bodyContent
  };
}

// 计算字数（中文）
function countChineseWords(text) {
  const chineseChars = text.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g);
  return chineseChars ? chineseChars.length : 0;
}

// 章节分割
function splitIntoChapters(content, targetWords) {
  const words = countChineseWords(content);
  const chapters = [];
  
  if (words <= targetWords) {
    return [{
      title: '第一章',
      content: content,
      wordCount: words
    }];
  }
  
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  let currentChapter = '';
  let currentWords = 0;
  let chapterNumber = 1;
  
  for (const paragraph of paragraphs) {
    const paragraphWords = countChineseWords(paragraph);
    
    if (currentWords + paragraphWords > targetWords && currentChapter) {
      chapters.push({
        title: `第${chapterNumber}章`,
        content: currentChapter,
        wordCount: currentWords
      });
      
      currentChapter = paragraph;
      currentWords = paragraphWords;
      chapterNumber++;
    } else {
      currentChapter += (currentChapter ? '\n\n' : '') + paragraph;
      currentWords += paragraphWords;
    }
  }
  
  if (currentChapter) {
    chapters.push({
      title: `第${chapterNumber}章`,
      content: currentChapter,
      wordCount: currentWords
    });
  }
  
  return chapters;
}

// AI补全章节
async function aiCompleteChapter(env, novel, samples, existingContent, targetWords) {
  const styleText = samples.join('\n\n---\n\n');
  
  const systemPrompt = `你是一位经验丰富的小说作家。请仔细阅读以下样本文本，学习其写作风格特点：

【样本文本】
${styleText}

【写作风格要点】
- 模仿样本的叙事风格和节奏
- 保持相似的语言特点
- 注意细节描写和情感表达`;

  const wordsToGenerate = Math.max(0, targetWords - countChineseWords(existingContent));
  
  const userPrompt = `【小说信息】
标题：${novel.title}
类型：${novel.genre}
简介：${novel.intro}

【已写内容】
${existingContent}

请续写内容，使总字数达到约${targetWords}字。
要求：
1. 保持与样本文本相同的写作风格
2. 情节自然衔接上文
3. 字数控制在 ${wordsToGenerate} 字左右
4. 输出正文内容，不要标题`;

  const generated = await callMiniMaxAPI(env, systemPrompt, userPrompt);
  
  return {
    content: existingContent + '\n\n' + (generated || ''),
    wordCount: countChineseWords(existingContent + '\n\n' + (generated || ''))
  };
}

// 判定小说类型
function determineStoryType(totalWords) {
  if (totalWords <= CONFIG.shortStoryThreshold) {
    return '短篇';
  } else if (totalWords <= CONFIG.mediumStoryThreshold) {
    return '中篇';
  } else {
    return '长篇';
  }
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
}`;
  
  fs.writeFileSync(CONFIG.dataFile, content, 'utf-8');
}

// 保存到小说数据（修复重复添加bug）
async function saveToNovelsData(novelInfo, chapters) {
  const data = await loadNovelsData();
  
  // 生成小说ID
  const novelId = novelInfo.title.toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  
  // 使用默认作者
  const authorId = 'author4';
  const author = data.authors.find(a => a.id === authorId) || data.authors[0];
  
  // 检查是否已存在
  const existingNovelIndex = data.novels.findIndex(n => n.id === novelId);
  
  if (existingNovelIndex !== -1) {
    // 更新现有小说
    data.novels[existingNovelIndex] = {
      ...data.novels[existingNovelIndex],
      status: '连载中',
      totalChapters: (data.chapters[novelId]?.length || 0) + chapters.length,
      lastUpdate: new Date().toISOString().split('T')[0],
      intro: novelInfo.intro || data.novels[existingNovelIndex].intro,
      genre: novelInfo.genre || data.novels[existingNovelIndex].genre
    };
    logInfo(`Updated existing novel: ${novelId}`);
  } else {
    // 创建新小说
    const newNovel = {
      id: novelId,
      title: novelInfo.title,
      intro: novelInfo.intro || '这是一个充满情感的故事...',
      genre: novelInfo.genre || '文艺',
      authorId: authorId,
      authorName: author.name,
      status: '连载中',
      totalChapters: chapters.length,
      lastUpdate: new Date().toISOString().split('T')[0],
      tags: ['文艺', '情感', '成长']
    };
    data.novels.push(newNovel);
    logInfo(`Added new novel: ${novelId}`);
  }
  
  // 添加章节
  if (!data.chapters[novelId]) {
    data.chapters[novelId] = [];
  }
  
  chapters.forEach((chapter, index) => {
    data.chapters[novelId].push({
      id: `${novelId}-c-${Date.now()}-${index}`,
      novelId: novelId,
      number: data.chapters[novelId].length + 1,
      title: chapter.title,
      content: chapter.content,
      wordCount: chapter.wordCount,
      publishedAt: new Date().toISOString().split('T')[0]
    });
  });
  
  // 保存数据
  saveNovelsData(data);
  logInfo(`Saved ${novelInfo.title} with ${chapters.length} chapters`);
}

// 主函数
async function main() {
  logInfo('=== Novel Processor Started ===');
  
  const env = loadEnv();
  const samples = loadSamples();
  
  if (samples.length === 0) {
    logWarn('No style samples found. Please add sample-*.txt files to samples/');
    return;
  }
  
  logInfo(`Loaded ${samples.length} style samples`);
  
  // 读取prompts目录下的文件
  if (!fs.existsSync(CONFIG.promptsDir)) {
    logWarn('Prompts directory not found');
    return;
  }
  
  const promptFiles = fs.readdirSync(CONFIG.promptsDir)
    .filter(f => f.startsWith('novel-') && f.endsWith('-start.txt'));
  
  logInfo(`Found ${promptFiles.length} novel start files`);
  
  if (promptFiles.length === 0) {
    logInfo('No novel start files to process');
    return;
  }
  
  for (const file of promptFiles) {
    const filePath = path.join(CONFIG.promptsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    logInfo(`Processing: ${file}`);
    
    // 解析小说信息
    const novelInfo = parseNovelStart(content);
    logInfo(`Title: ${novelInfo.title}, Genre: ${novelInfo.genre}`);
    
    // 计算原始字数
    const originalWords = countChineseWords(novelInfo.content);
    logInfo(`Original words: ${originalWords}`);
    
    // 章节分割或AI补全
    let chapters;
    if (originalWords > CONFIG.targetChapterWords) {
      chapters = splitIntoChapters(novelInfo.content, CONFIG.targetChapterWords);
      logInfo(`Split into ${chapters.length} chapters`);
    } else {
      logInfo(`Need AI completion (target: ${CONFIG.targetChapterWords} words)`);
      try {
        const completed = await aiCompleteChapter(env, novelInfo, samples, novelInfo.content, CONFIG.targetChapterWords);
        chapters = [{
          title: '第一章',
          content: completed.content,
          wordCount: completed.wordCount
        }];
        logInfo(`AI completed: ${completed.wordCount} words`);
      } catch (error) {
        logError(`AI completion failed: ${error.message}`);
        // 使用原始内容
        chapters = [{
          title: '第一章',
          content: novelInfo.content,
          wordCount: originalWords
        }];
      }
    }
    
    // 计算总字数
    const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
    logInfo(`Total words: ${totalWords}`);
    
    // 判定小说类型
    const storyType = determineStoryType(totalWords);
    logInfo(`Story type: ${storyType}`);
    
    // 保存到小说数据
    await saveToNovelsData(novelInfo, chapters);
    logInfo(`Processed and saved ${novelInfo.title} successfully`);
  }
  
  logInfo('=== Novel Processor Finished ===');
}

main().catch(error => {
  logError(`FATAL: ${error.message}`);
  process.exit(1);
});
