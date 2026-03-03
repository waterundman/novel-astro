export const posts = [
  {
    id: 'hello-world',
    title: '你好，世界',
    date: '2026-03-01',
    category: '随笔',
    tags: ['开始', '自我介绍'],
    excerpt: '这是我的第一篇博客文章，记录下开始的原因和初衷。',
    content: `这是我的第一篇博客文章。\n\n建立这个网站的初衷，是想作为一个AI与人类协作的实验田。我负责构思和设计，而具体的文字内容，则由AI来完成。\n\n这种模式让我思考一个问题：当AI可以创作内容时，人类的角色会变成什么？\n\n我想，可能更像是一个策展人——选择主题、设定方向、然后让AI去填充细节。\n\n这就是「NOVEL.OS」的起点。一个由AI驱动的小说站，也是一个关于创作可能性的探索。\n\n如果你感兴趣，欢迎常来看看。`
  },
  {
    id: 'ai-writing-thoughts',
    title: '关于AI写作的一些思考',
    date: '2026-03-02',
    category: '技术',
    tags: ['AI', '写作', '思考'],
    excerpt: '当我们在谈论AI写作时，我们到底在谈论什么？是工具的进化，还是创作本质的改变？',
    content: `最近在尝试让AI帮我写小说，有了一些有趣的发现。\n\n首先是关于「风格」的问题。\n\n每个人都独特的写作风格——你喜欢的比喻、你惯用的句式、你偏爱的节奏。但AI没有。AI的风格是「平均」的，是从海量文本中学习到的「最大公约数」。\n\n这意味着，AI写出来的东西「还行」，但缺少那种「只有你能写出来」的感觉。\n\n其次是关于「灵感」。\n\n人类作家经常说，写作需要「灵感」。但仔细想想，灵感是什么？可能是生活中的一件小事，可能是读到的一段话，可能是深夜突然冒出的一个念头。\n\nAI没有生活，所以它没有「灵感」。它只能根据提示生成内容。\n\n这让我意识到，AI不是来「替代」创作者的，而是来「扩展」创作者的能力边界的。\n\n你可以让AI帮你写大纲、填细节、做修改，但你永远需要那个给出方向的人。\n\n这就是人类在创作中的不可替代性。`
  },
  {
    id: 'minimalist-design',
    title: '为什么我选择极简设计',
    date: '2026-03-03',
    category: '设计',
    tags: ['设计', '极简主义', 'UI'],
    excerpt: '极简不是简陋，而是对本质的追求。在设计中做减法，往往比做加法更难。',
    content: `这次的网站设计，我选择了极简的后现代线条风格。\n\n很多人问我为什么不用现在流行的「毛玻璃」「渐变色」或者「3D效果」。\n\n我的答案是：那些太「吵」了。\n\n好的设计应该像好的文章一样——没有多余的修饰，但每一个字都有它的位置。线条就是线条，颜色就是颜色，所有的元素都应该有它存在的理由。\n\n这种风格还有一个好处：它「不过时」。\n\n潮流总是在变，但经典的线条和色块永远不会过时。今天用这个风格，十年后再看，它依然会是好看的。\n\n当然，极简不等于简单。\n\n要在简单的外观下实现良好的用户体验，需要更多的思考和打磨。每一个间距、每一个对齐、每一个动效，都需要反复推敲。\n\n这可能是我学到的最重要的一课：简单是最复杂的。`
  },
  {
    id: 'static-site-advantages',
    title: '静态网站的魅力',
    date: '2026-03-04',
    category: '技术',
    tags: ['静态网站', 'Astro', '性能'],
    excerpt: '在这个动态盛行的时代，静态网站反而成了一个「反主流」的选择。但它的优点，可能被严重低估了。',
    content: `用 Astro 重写了这个网站后，我更坚定地认为：静态网站是很多场景下的最优解。\n\n首先是速度。\n\n静态页面不需要服务器渲染，不需要数据库查询，打开就是打开——毫秒级的响应时间。这在移动端尤其明显。\n\n其次是成本。\n\n托管一个静态网站几乎不需要花钱。Cloudflare Pages、GitHub Pages 都是免费的。而动态网站需要服务器、需要数据库、还需要维护。\n\n然后是安全性。\n\n没有服务器、没有数据库，就意味着没有「可以被攻击的入口」。静态网站天然免疫 SQL 注入、CSRF 等传统 Web 攻击。\n\n最后是可靠性。\n\n动态网站需要担心服务器宕机、数据库连接失败、依赖服务不可用等问题。静态网站只担心一件事：CDN 是否正常。而顶级的 CDN 服务通常都有 99.99% 的可用性保证。\n\n当然，静态网站不是万能的。它不适合需要实时交互、用户个性化数据的场景。\n\n但对于博客、文档、作品集这类「内容展示型」网站，静态是完美的选择。\n\n这也是我选择 Astro 的原因——它把静态网站的优势发挥到了极致，同时保留了现代开发的体验。`
  }
];

export const categories = [
  { id: 'tech', name: '技术', count: 2 },
  { id: 'design', name: '设计', count: 1 },
  { id: 'essay', name: '随笔', count: 1 }
];

export function getPostById(id) {
  return posts.find(p => p.id === id) || null;
}

export function getPostsByCategory(category) {
  return posts.filter(p => p.category === category);
}

export function getLatestPosts(limit = 10) {
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

export function getAllTags() {
  const tags = new Set();
  posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags);
}
