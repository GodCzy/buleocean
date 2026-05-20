import { createKnowledgeAdapter } from '@/data/knowledge/createKnowledgeAdapter'

export const marineRagKnowledgePathAdapter = createKnowledgeAdapter({
  id: 'rag-lab',
  themeName: '动态问诊与 RAG 问答',
  defaultQuestion: '如果我要回答“南美白对虾出现摄食下降和体色发暗，该如何进行初筛诊断”，应该先从哪条问诊路径开始？',
  version: 'blueocean-v1',
  manifestSummary: {
    card_count: 8
  },
  cardTitleMap: {
    'query-plan-card': '问诊拆解卡',
    'chunk-ranking-card': '证据排序卡',
    'citation-card': '引用落地卡',
    'answer-grounding-card': '回答约束卡',
    'hybrid-recall-card': '混合召回卡'
  },
  labelMap: {
    retrieval_plan: '检索规划',
    evidence_fusion: '证据融合',
    answer_grounding: '回答落地',
    query_rewrite: '问题改写',
    retrieval_ready: '检索优先',
    hybrid_search: '混合召回',
    evidence_view: '证据视图',
    citation_ready: '引用输出',
    rerank: '重排序',
    rag: 'RAG 问答'
  },
  stageLabel: '问答主线',
  stageTitle: '先锁定问诊主线，再组织证据、回答与引用',
  stageSubtitle: '每条路径都会把症状输入、向量召回、证据排序和回答 grounding 组织成可展示的问答流程。',
  workspaceHint: '先选一条问诊路径，再把它带到问答或图谱视图继续展开。',
  routeTone: '围绕动态问诊链路组织上下文，突出证据可追溯和回答可解释能力。',
  showcaseMeta: {
    eyebrow: '问答模块',
    title: '问诊路径与证据闭环',
    description: '重点展示问题拆解、证据排序和回答落地之间如何形成一条可解释链路。',
    stats: {
      cards: '问答卡',
      recommendations: '问诊路径',
      graphs: '证据闭环'
    },
    recommendationTitle: '问诊路径',
    recommendationDescription: '用于说明蓝海智询如何把问题、证据和回答组织在一起。',
    graphTitle: '证据闭环',
    graphDescription: '图谱侧聚焦 query、chunk、rerank 和 answer 之间的衔接关系。'
  },
  recommendationCandidates: [
    {
      candidate_id: 'rag-query-plan-route',
      title: '先做问诊拆解',
      build_title: '问诊拆解卡',
      next_scene: 'retrieval_plan',
      graph_loop_id: 'rag-query-plan-loop',
      build_card_id: 'query-plan-card',
      why_selected: [
        '先把问题拆成宿主、症状、环境和时间窗四类意图，最能体现动态问诊不是直接生成，而是先建诊断计划。',
        '这条路径可以直观展示系统如何把“监测输入”转换成“检索动作”。'
      ],
      next_card_items: [
        { id: 'hybrid-recall-card', title: '混合召回卡' },
        { id: 'chunk-ranking-card', title: '证据排序卡' }
      ],
      filters: {
        experience_level: 'query_rewrite',
        budget_level: 'retrieval_ready',
        playstyle: ['hybrid_search', 'evidence_view'],
        content_goals: ['rag']
      }
    },
    {
      candidate_id: 'rag-evidence-fusion-route',
      title: '聚焦证据融合',
      build_title: '证据排序卡',
      next_scene: 'evidence_fusion',
      graph_loop_id: 'rag-evidence-fusion-loop',
      build_card_id: 'chunk-ranking-card',
      why_selected: [
        '证据融合最适合展示向量召回结果如何被排序、聚合并压缩成回答素材。',
        '它能让老师看到系统并不是“聊天”，而是在做严肃的知识证据编排。'
      ],
      next_card_items: [
        { id: 'query-plan-card', title: '问诊拆解卡' },
        { id: 'citation-card', title: '引用落地卡' }
      ],
      filters: {
        experience_level: 'rerank',
        budget_level: 'retrieval_ready',
        playstyle: ['evidence_view', 'citation_ready'],
        content_goals: ['rag']
      }
    },
    {
      candidate_id: 'rag-answer-grounding-route',
      title: '强调回答落地',
      build_title: '回答约束卡',
      next_scene: 'answer_grounding',
      graph_loop_id: 'rag-answer-grounding-loop',
      build_card_id: 'answer-grounding-card',
      why_selected: [
        '如果展示重点是“回答为什么可信”，这条路径最适合把引用、边界和回答模板一起呈现。',
        '它可以把初筛结论、处置建议和继续追问都统一到同一套输出结构里。'
      ],
      next_card_items: [
        { id: 'citation-card', title: '引用落地卡' },
        { id: 'chunk-ranking-card', title: '证据排序卡' }
      ],
      filters: {
        experience_level: 'citation_ready',
        budget_level: 'retrieval_ready',
        playstyle: ['evidence_view', 'hybrid_search'],
        content_goals: ['rag']
      }
    }
  ],
  graphLoops: [
    {
      graph_id: 'rag-query-plan-loop',
      label: '问诊拆解闭环',
      focus: 'retrieval_plan',
      node_count: 5,
      edge_count: 4,
      entry_card_id: 'query-plan-card',
      build_card_id: 'query-plan-card',
      related_cards: [
        { id: 'query-plan-card', title: '问诊拆解卡' },
        { id: 'hybrid-recall-card', title: '混合召回卡' }
      ],
      nodes: [
        { type: 'query', label: '用户问题' },
        { type: 'intent', label: '问诊意图' },
        { type: 'rewrite', label: '问题改写' }
      ]
    },
    {
      graph_id: 'rag-evidence-fusion-loop',
      label: '证据融合闭环',
      focus: 'evidence_fusion',
      node_count: 6,
      edge_count: 5,
      entry_card_id: 'chunk-ranking-card',
      build_card_id: 'chunk-ranking-card',
      related_cards: [
        { id: 'chunk-ranking-card', title: '证据排序卡' },
        { id: 'citation-card', title: '引用落地卡' }
      ],
      nodes: [
        { type: 'chunk', label: '知识分片' },
        { type: 'rerank', label: '相关性排序' },
        { type: 'evidence', label: '证据摘要' }
      ]
    },
    {
      graph_id: 'rag-answer-grounding-loop',
      label: '回答落地闭环',
      focus: 'answer_grounding',
      node_count: 6,
      edge_count: 5,
      entry_card_id: 'answer-grounding-card',
      build_card_id: 'answer-grounding-card',
      related_cards: [
        { id: 'answer-grounding-card', title: '回答约束卡' },
        { id: 'citation-card', title: '引用落地卡' }
      ],
      nodes: [
        { type: 'answer', label: '回答模板' },
        { type: 'citation', label: '引用证据' },
        { type: 'constraint', label: '边界约束' }
      ]
    }
  ]
})
