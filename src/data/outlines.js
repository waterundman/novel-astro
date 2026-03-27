/**
 * 小说大纲数据
 * 
 * 每部小说都有完整的故事大纲，包含：
 * - 主线剧情：起、承、转、合四个阶段
 * - 每个阶段包含若干章节的详细规划
 * - 章节规划包含：标题、核心情节、情感基调、关键元素
 */

export const outlines = {
  "xueyan": {
    "title": "雪燕",
    "theme": "在海岛的旅程中，主人公通过与神秘女孩的相遇，完成对青春、爱情和自我的探索",
    "mainCharacters": [
      { "name": "我", "role": "主人公，迷茫的年轻人，寻找生命意义" },
      { "name": "雪燕", "role": "神秘女孩，自由如风，象征理想与自由" }
    ],
    "totalChapters": 12,
    "phases": {
      "setup": {
        "name": "起",
        "chapters": [1, 2, 3],
        "goal": "建立主人公的状态，引入海岛之旅，初遇雪燕",
        "chapters_plan": [
          {
            "number": 1,
            "title": "海岛的呼唤",
            "core_plot": "主人公在城市生活中感到疲惫，决定去海岛旅行",
            "emotion": "期待、迷茫",
            "key_elements": ["辞职旅行", "山穹港", "海风"]
          },
          {
            "number": 2,
            "title": "沙洲上的低语",
            "core_plot": "到达海岛，漫步沙滩，感受海岛的宁静",
            "emotion": "宁静、新鲜",
            "key_elements": ["贝壳店", "老船长", "北岛传说"]
          },
          {
            "number": 3,
            "title": "梦回北岛",
            "core_plot": "踏上北岛，在茶馆中第一次遇见雪燕",
            "emotion": "心动、好奇",
            "key_elements": ["古桥", "茶馆", "雪燕初现"]
          }
        ]
      },
      "development": {
        "name": "承",
        "chapters": [4, 5, 6, 7],
        "goal": "深化两人关系，探索海岛建立情感连接",
        "chapters_plan": [
          {
            "number": 4,
            "title": "天边的云彩",
            "core_plot": "与雪燕的第一次深入交谈，了解她对自由的理解",
            "emotion": "共鸣、向往",
            "key_elements": ["水彩画", "云的比喻", "自由话题"]
          },
          {
            "number": 5,
            "title": "夜海星语",
            "core_plot": "夜晚在海边看星星，雪燕讲述自己的故事",
            "emotion": "亲密、温柔",
            "key_elements": ["星空", "童年回忆", "秘密"]
          },
          {
            "number": 6,
            "title": "渔村的清晨",
            "core_plot": "跟随雪燕体验渔民生活，感受简单的快乐",
            "emotion": "充实、温暖",
            "key_elements": ["渔网", "日出", "海鲜早餐"]
          },
          {
            "number": 7,
            "title": "纸鹤的愿望",
            "core_plot": "雪燕教主人公折纸鹤，写下愿望放飞",
            "emotion": "甜蜜、期待",
            "key_elements": ["折纸", "愿望", "海风中的纸鹤"]
          }
        ]
      },
      "climax": {
        "name": "转",
        "chapters": [8, 9, 10],
        "goal": "冲突出现，雪燕的身世秘密，主人公的内心挣扎",
        "chapters_plan": [
          {
            "number": 8,
            "title": "暴风雨前",
            "core_plot": "发现雪燕有心事，她似乎在逃避什么",
            "emotion": "担忧、困惑",
            "key_elements": ["沉默", "乌云", "不安"]
          },
          {
            "number": 9,
            "title": "灯塔的告白",
            "core_plot": "在灯塔下，雪燕说出自己即将离开海岛",
            "emotion": "心痛、不舍",
            "key_elements": ["灯塔", "告白", "离别"]
          },
          {
            "number": 10,
            "title": "最后一夜",
            "core_plot": "两人一起度过最后一夜，珍惜每一刻",
            "emotion": "珍惜、感伤",
            "key_elements": ["月光", "承诺", "回忆"]
          }
        ]
      },
      "resolution": {
        "name": "合",
        "chapters": [11, 12],
        "goal": "离别与成长，主人公找到内心的平静",
        "chapters_plan": [
          {
            "number": 11,
            "title": "晨曦的告别",
            "core_plot": "在日出时分送别雪燕，彼此祝福",
            "emotion": "释然、祝福",
            "key_elements": ["日出", "拥抱", "祝福"]
          },
          {
            "number": 12,
            "title": "心中的雪燕",
            "core_plot": "主人公独自在海岛上思考，明白了雪燕的意义",
            "emotion": "成长、希望",
            "key_elements": ["纸鹤", "回信", "新的开始"]
          }
        ]
      }
    }
  },

  "sidiaooshui": {
    "title": "四季凋水",
    "theme": "通过电影与哲学的思考，冯措在孤独中寻找生命的意义，最终与自己和解",
    "mainCharacters": [
      { "name": "冯措", "role": "主人公，沉思的文艺青年，对存在感到困惑" }
    ],
    "totalChapters": 10,
    "phases": {
      "setup": {
        "name": "起",
        "chapters": [1, 2],
        "goal": "建立冯措的孤独状态，引入他对电影和哲学的执念",
        "chapters_plan": [
          {
            "number": 1,
            "title": "电影与哲学",
            "core_plot": "深夜独自观看文艺电影，沉浸在黑白光影中",
            "emotion": "孤独、沉思",
            "key_elements": ["深夜影院", "黑白电影", "哲学台词"]
          },
          {
            "number": 2,
            "title": "草原之梦",
            "core_plot": "电影中的意象引发对生命痛苦的思考",
            "emotion": "痛苦、挣扎",
            "key_elements": ["草原", "裸体男子", "血迹"]
          }
        ]
      },
      "development": {
        "name": "承",
        "chapters": [3, 4, 5, 6],
        "goal": "冯措的日常思考，与周围世界的疏离感",
        "chapters_plan": [
          {
            "number": 3,
            "title": "咖啡馆的沉思",
            "core_plot": "在深夜咖啡馆与老板娘的对话，思考人为什么要活着",
            "emotion": "困惑、温暖",
            "key_elements": ["咖啡馆", "老板娘", "生命意义"]
          },
          {
            "number": 4,
            "title": "旧书市场",
            "core_plot": "在旧书市场发现一本关于存在主义的书",
            "emotion": "惊喜、专注",
            "key_elements": ["旧书", "存在主义", "笔记"]
          },
          {
            "number": 5,
            "title": "雨中的独白",
            "core_plot": "下雨天在窗边写下对世界的思考",
            "emotion": "忧郁、释放",
            "key_elements": ["雨", "笔记本", "独白"]
          },
          {
            "number": 6,
            "title": "陌生人的故事",
            "core_plot": "在公园遇到一位老人，听他讲述人生故事",
            "emotion": "感动、启发",
            "key_elements": ["公园", "老人", "人生智慧"]
          }
        ]
      },
      "climax": {
        "name": "转",
        "chapters": [7, 8, 9],
        "goal": "冯措经历内心的转折，开始理解生活的另一面",
        "chapters_plan": [
          {
            "number": 7,
            "title": "照片的意义",
            "core_plot": "整理旧照片时，发现曾经忽视的美好瞬间",
            "emotion": "怀念、醒悟",
            "key_elements": ["旧照片", "回忆", "被忽视的美"]
          },
          {
            "number": 8,
            "title": "四季的更迭",
            "core_plot": "在一天中感受四季的变化，理解生命的流转",
            "emotion": "感悟、平静",
            "key_elements": ["四季", "变化", "接受"]
          },
          {
            "number": 9,
            "title": "给过去的信",
            "core_plot": "写一封信给过去的自己，原谅曾经的迷茫",
            "emotion": "释然、和解",
            "key_elements": ["信", "原谅", "成长"]
          }
        ]
      },
      "resolution": {
        "name": "合",
        "chapters": [10],
        "goal": "冯措找到内心的平静，继续前行",
        "chapters_plan": [
          {
            "number": 10,
            "title": "新的胶片",
            "core_plot": "买了一卷新胶片，准备记录生活中的美好",
            "emotion": "希望、新生",
            "key_elements": ["胶片", "相机", "新开始"]
          }
        ]
      }
    }
  },

  "shaonvshidai": {
    "title": "少女时代",
    "theme": "通过日记回忆青春岁月，完成对过去的告别和对美的重新理解",
    "mainCharacters": [
      { "name": "我", "role": "叙述者，身患疾病，回忆少女时代" },
      { "name": "她", "role": "记忆中的少女，美丽、自由、充满生命力" }
    ],
    "totalChapters": 10,
    "phases": {
      "setup": {
        "name": "起",
        "chapters": [1, 2],
        "goal": "建立叙述者的现状，引出回忆",
        "chapters_plan": [
          {
            "number": 1,
            "title": "记忆中的少女",
            "core_plot": "在病痛中回忆起9岁那年遇见的那个少女",
            "emotion": "怀念、感伤",
            "key_elements": ["疾病", "阳光", "少女的妆容"]
          },
          {
            "number": 2,
            "title": "纸上的岁月",
            "core_plot": "翻开日记本，开始记录那段记忆",
            "emotion": "温柔、期待",
            "key_elements": ["日记本", "照片", "青春记忆"]
          }
        ]
      },
      "development": {
        "name": "承",
        "chapters": [3, 4, 5, 6, 7],
        "goal": "回忆与少女相处的点点滴滴",
        "chapters_plan": [
          {
            "number": 3,
            "title": "温柔时光的回响",
            "core_plot": "回忆校园里的相遇，分享梦想和秘密",
            "emotion": "甜蜜、纯真",
            "key_elements": ["校园", "手链", "梦想"]
          },
          {
            "number": 4,
            "title": "夏日的画笔",
            "core_plot": "少女教我画画，用色彩表达情感",
            "emotion": "快乐、创造",
            "key_elements": ["画笔", "水彩", "夏日阳光"]
          },
          {
            "number": 5,
            "title": "秘密花园",
            "core_plot": "发现一个只属于两人的秘密花园",
            "emotion": "惊喜、专属",
            "key_elements": ["花园", "野花", "秘密"]
          },
          {
            "number": 6,
            "title": "雨季的约定",
            "core_plot": "在雨中约定要一起去看海",
            "emotion": "浪漫、期待",
            "key_elements": ["雨", "约定", "海"]
          },
          {
            "number": 7,
            "title": "秋天的告别",
            "core_plot": "少女突然转学，没有告别就离开了",
            "emotion": "失落、不解",
            "key_elements": ["秋天", "落叶", "空白"]
          }
        ]
      },
      "climax": {
        "name": "转",
        "chapters": [8, 9],
        "goal": "多年后的重逢与理解",
        "chapters_plan": [
          {
            "number": 8,
            "title": "重逢的消息",
            "core_plot": "多年后收到少女的信，得知她也一直在找我",
            "emotion": "震惊、激动",
            "key_elements": ["信", "重逢", "时间"]
          },
          {
            "number": 9,
            "title": "海的约定",
            "core_plot": "终于一起去看了海，完成了当年的约定",
            "emotion": "圆满、感动",
            "key_elements": ["海", "约定", "夕阳"]
          }
        ]
      },
      "resolution": {
        "name": "合",
        "chapters": [10],
        "goal": "对青春的释怀，对美的新理解",
        "chapters_plan": [
          {
            "number": 10,
            "title": "美的定义",
            "core_plot": "在病床上写下对美的新理解：美就是那些让我们心动的瞬间",
            "emotion": "释然、温暖",
            "key_elements": ["日记", "美", "永恒"]
          }
        ]
      }
    }
  },

  "menglongdejishigan": {
    "title": "朦胧的既视感",
    "theme": "在失落中寻找自我，通过音乐和回忆与过去和解",
    "mainCharacters": [
      { "name": "我", "role": "刚经历考试失败的年轻人，在迷失中寻找方向" }
    ],
    "totalChapters": 8,
    "phases": {
      "setup": {
        "name": "起",
        "chapters": [1, 2],
        "goal": "建立失落的状态，引入废弃住宅区的意象",
        "chapters_plan": [
          {
            "number": 1,
            "title": "废弃的住宅区",
            "core_plot": "考试后感到迷失，走进废弃的住宅区",
            "emotion": "失落、迷茫",
            "key_elements": ["考试", "废弃", "笛声"]
          },
          {
            "number": 2,
            "title": "音符间的低语",
            "core_plot": "跟随笛声，在废墟中写下内心的独白",
            "emotion": "忧伤、释放",
            "key_elements": ["笛声", "笔记本", "独白"]
          }
        ]
      },
      "development": {
        "name": "承",
        "chapters": [3, 4, 5],
        "goal": "在回忆中寻找支撑",
        "chapters_plan": [
          {
            "number": 3,
            "title": "旧时光的碎片",
            "core_plot": "回忆童年在这片住宅区的快乐时光",
            "emotion": "怀念、温暖",
            "key_elements": ["童年", "伙伴", "游戏"]
          },
          {
            "number": 4,
            "title": "父亲的背影",
            "core_plot": "想起父亲曾在这里教自己骑车",
            "emotion": "感伤、思念",
            "key_elements": ["父亲", "自行车", "背影"]
          },
          {
            "number": 5,
            "title": "未完成的歌",
            "core_plot": "找到小时候写的歌词，决定把它完成",
            "emotion": "希望、创造",
            "key_elements": ["歌词", "旋律", "完成"]
          }
        ]
      },
      "climax": {
        "name": "转",
        "chapters": [6, 7],
        "goal": "面对失败，找到新的意义",
        "chapters_plan": [
          {
            "number": 6,
            "title": "失败的意义",
            "core_plot": "在废墟中思考失败对自己的意义",
            "emotion": "接受、释然",
            "key_elements": ["废墟", "思考", "接受"]
          },
          {
            "number": 7,
            "title": "新的旋律",
            "core_plot": "为那首未完成的歌写下新的旋律",
            "emotion": "创造、希望",
            "key_elements": ["旋律", "创作", "新生"]
          }
        ]
      },
      "resolution": {
        "name": "合",
        "chapters": [8],
        "goal": "走出废墟，重新开始",
        "chapters_plan": [
          {
            "number": 8,
            "title": "晨光中的脚步",
            "core_plot": "在清晨离开废墟，带着新的决心走向未来",
            "emotion": "希望、坚定",
            "key_elements": ["晨光", "脚步", "新开始"]
          }
        ]
      }
    }
  },

  "chunbaidélijiaoxia": {
    "title": "纯白的立交桥下",
    "theme": "一对年轻人在浪漫的氛围中相遇相爱，经历了青春的甜蜜与考验",
    "mainCharacters": [
      { "name": "林浩", "role": "大二学生，爱好音乐，温柔内敛" },
      { "name": "苏瑾", "role": "美术系才女，画作充满安宁感" }
    ],
    "totalChapters": 10,
    "phases": {
      "setup": {
        "name": "起",
        "chapters": [1, 2],
        "goal": "建立两人的相遇，许下承诺",
        "chapters_plan": [
          {
            "number": 1,
            "title": "柳叶餐厅",
            "core_plot": "林浩在柳叶餐厅约见苏瑾，回忆第一次相遇",
            "emotion": "紧张、甜蜜",
            "key_elements": ["柳叶餐厅", "画展", "初遇"]
          },
          {
            "number": 2,
            "title": "漫长的夜晚与初春的承诺",
            "core_plot": "林浩送给苏瑾戒指，两人确定关系",
            "emotion": "感动、承诺",
            "key_elements": ["戒指", "承诺", "纯白立交桥"]
          }
        ]
      },
      "development": {
        "name": "承",
        "chapters": [3, 4, 5, 6],
        "goal": "恋爱中的甜蜜日常",
        "chapters_plan": [
          {
            "number": 3,
            "title": "画室的午后",
            "core_plot": "林浩去苏瑾的画室，看她画画",
            "emotion": "温馨、欣赏",
            "key_elements": ["画室", "油画", "阳光"]
          },
          {
            "number": 4,
            "title": "琴房的旋律",
            "core_plot": "苏瑾听林浩弹琴，为他画了一幅速写",
            "emotion": "浪漫、默契",
            "key_elements": ["钢琴", "速写", "音乐"]
          },
          {
            "number": 5,
            "title": "春日的野餐",
            "core_plot": "两人在公园野餐，分享彼此的梦想",
            "emotion": "快乐、期待",
            "key_elements": ["野餐", "梦想", "春天"]
          },
          {
            "number": 6,
            "title": "雨天的拥抱",
            "core_plot": "突遇大雨，两人共撑一把伞奔跑",
            "emotion": "刺激、亲密",
            "key_elements": ["雨", "奔跑", "拥抱"]
          }
        ]
      },
      "climax": {
        "name": "转",
        "chapters": [7, 8, 9],
        "goal": "考验出现，两人共同面对",
        "chapters_plan": [
          {
            "number": 7,
            "title": "分离的消息",
            "core_plot": "苏瑾获得出国交换的机会，面临选择",
            "emotion": "纠结、担忧",
            "key_elements": ["机会", "选择", "分离"]
          },
          {
            "number": 8,
            "title": "立交桥下的等待",
            "core_plot": "林浩在立交桥下等待苏瑾的决定",
            "emotion": "焦虑、期待",
            "key_elements": ["等待", "立交桥", "雨"]
          },
          {
            "number": 9,
            "title": "最长的一夜",
            "core_plot": "苏瑾决定留下，两人彻夜长谈",
            "emotion": "感动、珍惜",
            "key_elements": ["决定", "长谈", "承诺"]
          }
        ]
      },
      "resolution": {
        "name": "合",
        "chapters": [10],
        "goal": "爱情的升华",
        "chapters_plan": [
          {
            "number": 10,
            "title": "纯白的未来",
            "core_plot": "两人一起规划未来，在立交桥下许下新的愿望",
            "emotion": "幸福、希望",
            "key_elements": ["立交桥", "未来", "纯白"]
          }
        ]
      }
    }
  }
};

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
    if (phase.chapters.includes(currentChapterCount)) {
      return { key, ...phase };
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
