export const blueOceanGraphDemo = {
  title: '病-药-环知识图谱',
  subtitle: '围绕宿主、病原、症状、用药、环境压力和监测信号构建水生动物疾病知识网络，支撑“监测-诊断-决策”闭环。',
  stats: [
    { label: '实体节点', value: '1,286', hint: '宿主 / 病原 / 药物 / 环境 / 症状' },
    { label: '关系边', value: '4,872', hint: '致病 / 诱发 / 处置 / 禁忌 / 预警' },
    { label: '证据片段', value: '18.6k', hint: '手册 / 规范 / 病例 / 监测记录' },
    { label: '高风险链路', value: '46', hint: '已建立病-药-环因果回溯' }
  ],
  legend: [
    { label: '宿主', tone: 'host' },
    { label: '病原/疾病', tone: 'disease' },
    { label: '药物/处置', tone: 'drug' },
    { label: '环境/监测', tone: 'environment' },
    { label: '症状/证据', tone: 'symptom' }
  ],
  filters: ['石斑鱼', '南美白对虾', '寄生虫病', '细菌性病害', '氨氮异常', '合规用药'],
  nodes: [
    { id: 'grouper', x: 165, y: 310, label: '石斑鱼', meta: '宿主', tone: 'host', size: 48 },
    { id: 'shrimp', x: 170, y: 505, label: '南美白对虾', meta: '宿主', tone: 'host', size: 42 },
    { id: 'juvenile', x: 310, y: 190, label: '幼鱼阶段', meta: '生长阶段', tone: 'host', size: 32 },
    { id: 'ciliate', x: 410, y: 140, label: '刺激隐核虫', meta: '寄生虫', tone: 'disease', size: 42 },
    { id: 'vibrio', x: 445, y: 320, label: '弧菌感染', meta: '细菌性', tone: 'disease', size: 44 },
    { id: 'white-spot', x: 425, y: 515, label: '白斑综合征', meta: '病毒性', tone: 'disease', size: 38 },
    { id: 'gill', x: 680, y: 95, label: '鳃丝苍白', meta: '早期症状', tone: 'symptom', size: 34 },
    { id: 'scratch', x: 690, y: 230, label: '体表摩擦', meta: '行为异常', tone: 'symptom', size: 34 },
    { id: 'feed', x: 690, y: 380, label: '摄食下降', meta: '风险信号', tone: 'symptom', size: 34 },
    { id: 'bleeding', x: 700, y: 535, label: '体表出血', meta: '病灶表现', tone: 'symptom', size: 34 },
    { id: 'ammonia', x: 340, y: 650, label: '高氨氮', meta: '环境压力', tone: 'environment', size: 38 },
    { id: 'oxygen', x: 575, y: 650, label: '低溶氧', meta: '监测异常', tone: 'environment', size: 34 },
    { id: 'temp', x: 790, y: 650, label: '水温波动', meta: '预警信号', tone: 'environment', size: 36 },
    { id: 'enro', x: 925, y: 315, label: '恩诺沙星', meta: '处置药物', tone: 'drug', size: 38 },
    { id: 'salt', x: 920, y: 155, label: '淡水浴/盐浴', meta: '辅助处置', tone: 'drug', size: 36 },
    { id: 'quarantine', x: 925, y: 505, label: '隔离观察', meta: '管理动作', tone: 'drug', size: 36 },
    { id: 'microscope', x: 1080, y: 120, label: '镜检复核', meta: '检测证据', tone: 'symptom', size: 34 },
    { id: 'manual', x: 1080, y: 305, label: '疾病手册', meta: '文档证据', tone: 'symptom', size: 34 },
    { id: 'withdrawal', x: 1080, y: 490, label: '停药期', meta: '合规约束', tone: 'drug', size: 34 }
  ],
  edges: [
    { from: 'grouper', to: 'juvenile', label: '养殖阶段' },
    { from: 'juvenile', to: 'ciliate', label: '高敏感' },
    { from: 'grouper', to: 'ciliate', label: '易感宿主' },
    { from: 'grouper', to: 'vibrio', label: '常见病原' },
    { from: 'shrimp', to: 'white-spot', label: '关联病害' },
    { from: 'ciliate', to: 'gill', label: '诱发' },
    { from: 'ciliate', to: 'scratch', label: '伴随' },
    { from: 'vibrio', to: 'feed', label: '风险表现' },
    { from: 'vibrio', to: 'bleeding', label: '病灶' },
    { from: 'ammonia', to: 'vibrio', label: '放大风险' },
    { from: 'oxygen', to: 'feed', label: '监测异常' },
    { from: 'temp', to: 'ciliate', label: '提升风险' },
    { from: 'vibrio', to: 'enro', label: '确诊后处置' },
    { from: 'ciliate', to: 'salt', label: '辅助处置' },
    { from: 'vibrio', to: 'quarantine', label: '隔离管理' },
    { from: 'gill', to: 'microscope', label: '需要复核' },
    { from: 'scratch', to: 'manual', label: '证据命中' },
    { from: 'enro', to: 'withdrawal', label: '合规约束' },
    { from: 'manual', to: 'enro', label: '用药依据' },
    { from: 'ammonia', to: 'oxygen', label: '水质联动' },
    { from: 'oxygen', to: 'temp', label: '环境序列' }
  ],
  inspector: {
    entity: '石斑鱼疑似寄生虫-弧菌复合风险链',
    type: '病-药-环视角',
    confidence: '0.96',
    risk: '高',
    attributes: [
      ['宿主', '石斑鱼 / 幼鱼阶段'],
      ['候选病害', '刺激隐核虫、弧菌感染'],
      ['环境诱因', '氨氮升高、溶氧下降、水温波动'],
      ['处置边界', '先镜检复核，再进入药物方案']
    ],
    evidence: [
      { title: '海水鱼寄生虫病害监测手册', source: '疾病知识库 / 诊疗规范', score: '0.93' },
      { title: '高氨氮条件下弧菌扩增病例记录', source: '养殖场监测周报 / 病例库', score: '0.90' },
      { title: '水产用药合规与停药期说明', source: '药物处置指南 / 合规文档', score: '0.86' }
    ]
  },
  relationTable: [
    { chain: '石斑鱼 -> 刺激隐核虫 -> 鳃丝苍白 -> 镜检复核', score: 96, action: '优先排查' },
    { chain: '高氨氮 -> 弧菌感染 -> 恩诺沙星 -> 停药期', score: 92, action: '确诊后处置' },
    { chain: '水温波动 -> 寄生虫活跃 -> 体表摩擦', score: 88, action: '持续观察' },
    { chain: '低溶氧 -> 摄食下降 -> 环境应激', score: 83, action: '先调水质' }
  ]
}

export const blueOceanAgentDemo = {
  title: '动态问诊与 RAG 问答工作台',
  subtitle: '以类 ChatGPT 的对话工作流承载问诊、检索、证据引用和后续追问，让诊断过程可解释、可追溯。',
  session: {
    name: '石斑鱼病害分诊会话',
    model: 'OceanGPT-LoRA + RAG',
    namespace: 'disease_triage_chunks',
    topk: '8'
  },
  chats: [
    { title: '石斑鱼鳃丝苍白', meta: '进行中', active: true },
    { title: '南美白对虾摄食下降', meta: '已归档', active: false },
    { title: '氨氮升高风险预警', meta: '待复核', active: false }
  ],
  metrics: [
    { label: 'Top-3 覆盖', value: '85%' },
    { label: '证据引用', value: '9' },
    { label: '平均相似度', value: '0.88' },
    { label: '回答耗时', value: '1.9s' }
  ],
  queryPlan: [
    { label: '输入信号', value: '症状文本 + 图片观察 + 近 48 小时水质波动' },
    { label: '问诊状态机', value: '宿主 / 病程 / 环境 / 用药史四槽位追问' },
    { label: '召回策略', value: 'BM25 + FAISS 混合召回 + rerank' },
    { label: '输出边界', value: '初筛诊断、处置建议、继续检测项，不替代实验室确诊' }
  ],
  messages: [
    {
      role: 'user',
      name: '养殖户',
      text: '石斑鱼出现体表摩擦、鳃丝发白，最近两天氨氮升高。系统优先怀疑什么病害？需要先做哪些处理？',
      time: '10:21'
    },
    {
      role: 'assistant',
      name: '蓝海智询',
      text:
        '当前优先怀疑刺激隐核虫和弧菌感染两类风险。高氨氮与水温波动会放大细菌性风险，鳃丝苍白和体表摩擦则更接近寄生虫早期表现。建议先调水质并做镜检复核，再根据病原结果进入用药方案。',
      time: '10:21',
      citations: ['E1', 'E2', 'E3']
    },
    {
      role: 'assistant',
      name: '继续追问',
      text: '为了提高判断置信度，请补充：是否摄食下降？是否有镜检图片？是否近期换水或加药？',
      time: '10:22',
      compact: true
    }
  ],
  answerCards: [
    { title: '初筛结论', value: '寄生虫 + 细菌性风险并行排查', tone: 'blue' },
    { title: '优先处置', value: '控氨氮、补溶氧、稳定水温', tone: 'green' },
    { title: '继续检测', value: '鳃丝镜检、病灶图片、用药记录', tone: 'gold' }
  ],
  evidence: [
    {
      id: 'E1',
      title: '石斑鱼寄生虫病害监测手册',
      score: '0.92',
      source: '疾病知识库',
      quote: '鳃丝苍白与体表摩擦常作为寄生虫病害的早期监测信号。'
    },
    {
      id: 'E2',
      title: '海水网箱养殖巡检标准',
      score: '0.89',
      source: '监测规范',
      quote: '氨氮、溶氧和水温波动应作为早期分诊阶段的优先环境指标。'
    },
    {
      id: 'E3',
      title: '弧菌感染用药合规说明',
      score: '0.84',
      source: '药物指南',
      quote: '细菌性病害处置应在明确病原后进行，避免以经验性用药替代诊断。'
    }
  ],
  composer: '继续追问：如果要定位寄生虫风险，我应该优先补充哪两类证据？'
}

export const blueOceanVectorDemo = {
  title: '混合检索与预警评测中心',
  subtitle: '把向量集合、BM25 混合召回、metadata 过滤、RAG 评测和 48 小时环境预警放进同一个可运维控制台。',
  metrics: [
    { label: 'Collections', value: '14', hint: '病害 / 用药 / 环境 / 规范 / 图片' },
    { label: 'mAP 提升', value: '+15%', hint: '相对单路向量召回' },
    { label: 'Recall@5', value: '91.4%', hint: '病害问答评测集' },
    { label: '48h 预警命中', value: '70.8%', hint: '环境-疾病联动模型' }
  ],
  collections: [
    { name: 'disease_triage_chunks', count: '186k', dim: '1024', status: '在线', color: 'green', type: '病例与诊疗分片' },
    { name: 'disease_graph_edges', count: '58k', dim: '768', status: '在线', color: 'blue', type: '病-药-环关系边' },
    { name: 'env_warning_series', count: '96k', dim: '512', status: '评测中', color: 'gold', type: '水质时间序列' },
    { name: 'multimodal_casebook', count: '21k', dim: '1536', status: '扩容中', color: 'purple', type: '图片与病例对照' }
  ],
  schema: [
    ['当前集合', 'disease_triage_chunks'],
    ['混合检索', 'BM25 + FAISS / weighted fusion'],
    ['Embedding 模型', 'bge-m3 / 1024 dim'],
    ['Rerank 模型', 'bge-reranker-v2'],
    ['预警模型', 'LightGBM / 48h risk score'],
    ['更新窗口', '2026-05-16 09:40']
  ],
  filters: ['host = 石斑鱼', 'risk_level >= 中风险', 'source_type in 手册/巡检/病例', 'region = 辽东湾', 'time_window = 48h'],
  pipeline: [
    { label: '文档解析', value: '诊疗规范 / 巡检记录' },
    { label: '分片入库', value: 'chunk + metadata' },
    { label: '混合召回', value: 'BM25 + vector' },
    { label: '重排评测', value: 'rerank + citation' },
    { label: '预警输出', value: '风险分级 + 处置建议' }
  ],
  evaluations: [
    { label: 'Recall@5', value: 91 },
    { label: 'mAP', value: 84 },
    { label: 'Citation Hit', value: 78 },
    { label: 'Alert Hit Rate', value: 71 }
  ],
  heatmap: [
    [92, 88, 77, 64, 49],
    [81, 86, 79, 71, 56],
    [73, 82, 91, 76, 62],
    [66, 74, 80, 87, 69]
  ],
  queryReplay: [
    { rank: 'Top 1', title: '石斑鱼寄生虫病害监测手册', score: '0.92', namespace: 'disease_manual' },
    { rank: 'Top 2', title: '高氨氮条件下弧菌扩增记录', score: '0.88', namespace: 'env_reports' },
    { rank: 'Top 3', title: '近 48 小时环境波动预警卡', score: '0.84', namespace: 'warning_events' },
    { rank: 'Top 4', title: '弧菌感染用药合规说明', score: '0.81', namespace: 'drug_guideline' }
  ]
}
