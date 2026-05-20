import { createKnowledgeAdapter } from '@/data/knowledge/createKnowledgeAdapter'

export const vectorVaultKnowledgePathAdapter = createKnowledgeAdapter({
  id: 'vector-vault',
  themeName: '混合检索与预警中心',
  defaultQuestion: '如果我要比较病原病例库和环境预警库的召回质量，应该先从哪条向量路径开始？',
  version: 'blueocean-v1',
  manifestSummary: {
    card_count: 7
  },
  cardTitleMap: {
    'namespace-card': '命名空间设计卡',
    'multimodal-card': '多模态入库卡',
    'recall-benchmark-card': '召回评测卡',
    'metadata-filter-card': '元数据过滤卡',
    'collection-topology-card': '集合拓扑卡'
  },
  labelMap: {
    namespace_design: '命名空间',
    multimodal_ingest: '多模态入库',
    recall_benchmark: '召回评测',
    vector_db: '向量数据库',
    infra_ready: '基础设施优先',
    metadata_filter: '元数据过滤',
    recall_compare: '召回对比',
    collection_ops: '集合管理',
    evaluation: '评测视图'
  },
  stageLabel: '检索主线',
  stageTitle: '先锁定向量层主线，再展开集合、过滤和评测视角',
  stageSubtitle: '每条路径都会把集合设计、Embedding 接入、召回评估和元数据过滤组织成可展示的基础设施视图。',
  workspaceHint: '先选一条检索路径，再把它带到问答或图谱视图衔接上层能力。',
  routeTone: '围绕混合检索和预警评测组织基础设施，突出平台底层的可管理性与可评估性。',
  showcaseMeta: {
    eyebrow: '检索模块',
    title: '索引路径与召回闭环',
    description: '重点展示命名空间设计、多模态入库与召回评测如何支撑上层问答和预警。',
    stats: {
      cards: '检索卡',
      recommendations: '索引路径',
      graphs: '召回闭环'
    },
    recommendationTitle: '索引路径',
    recommendationDescription: '适合说明蓝海智询底层向量层如何支撑图谱、问答和预警。',
    graphTitle: '召回闭环',
    graphDescription: '图谱侧聚焦 collection、metadata、embedding 与 evaluation 之间的衔接。'
  },
  recommendationCandidates: [
    {
      candidate_id: 'vector-namespace-route',
      title: '先定命名空间',
      build_title: '命名空间设计卡',
      next_scene: 'namespace_design',
      graph_loop_id: 'vector-namespace-loop',
      build_card_id: 'namespace-card',
      why_selected: [
        '命名空间设计是向量知识库最容易讲清楚的一层，适合作为底层能力展示入口。',
        '它能把病例文档、监测数据、药物规范和图谱节点拆成清晰的知识域，方便解释平台的数据组织逻辑。'
      ],
      next_card_items: [
        { id: 'collection-topology-card', title: '集合拓扑卡' },
        { id: 'metadata-filter-card', title: '元数据过滤卡' }
      ],
      filters: {
        experience_level: 'vector_db',
        budget_level: 'infra_ready',
        playstyle: ['collection_ops', 'metadata_filter'],
        content_goals: ['evaluation']
      }
    },
    {
      candidate_id: 'vector-multimodal-route',
      title: '接入多模态向量',
      build_title: '多模态入库卡',
      next_scene: 'multimodal_ingest',
      graph_loop_id: 'vector-multimodal-loop',
      build_card_id: 'multimodal-card',
      why_selected: [
        '如果希望强调平台未来可扩展性，多模态入库最能体现蓝海智询对图片、检测结果和文本的统一组织能力。',
        '这条路径很适合和病害图片诊断、图谱节点说明做联动展示。'
      ],
      next_card_items: [
        { id: 'namespace-card', title: '命名空间设计卡' },
        { id: 'collection-topology-card', title: '集合拓扑卡' }
      ],
      filters: {
        experience_level: 'vector_db',
        budget_level: 'infra_ready',
        playstyle: ['collection_ops', 'recall_compare'],
        content_goals: ['evaluation']
      }
    },
    {
      candidate_id: 'vector-recall-route',
      title: '比较召回质量',
      build_title: '召回评测卡',
      next_scene: 'recall_benchmark',
      graph_loop_id: 'vector-recall-loop',
      build_card_id: 'recall-benchmark-card',
      why_selected: [
        '召回评测最适合把向量数据库从“存储层”变成“效果层”，方便展示它如何影响最终问答和预警结果。',
        '这条路径能自然连接到 RAG 模块里的 chunk 排序和回答质量。'
      ],
      next_card_items: [
        { id: 'metadata-filter-card', title: '元数据过滤卡' },
        { id: 'multimodal-card', title: '多模态入库卡' }
      ],
      filters: {
        experience_level: 'recall_compare',
        budget_level: 'infra_ready',
        playstyle: ['metadata_filter', 'collection_ops'],
        content_goals: ['evaluation']
      }
    }
  ],
  graphLoops: [
    {
      graph_id: 'vector-namespace-loop',
      label: '命名空间闭环',
      focus: 'namespace_design',
      node_count: 5,
      edge_count: 4,
      entry_card_id: 'namespace-card',
      build_card_id: 'namespace-card',
      related_cards: [
        { id: 'namespace-card', title: '命名空间设计卡' },
        { id: 'metadata-filter-card', title: '元数据过滤卡' }
      ],
      nodes: [
        { type: 'collection', label: '集合分仓' },
        { type: 'namespace', label: '知识域隔离' },
        { type: 'metadata', label: '过滤字段' }
      ]
    },
    {
      graph_id: 'vector-multimodal-loop',
      label: '多模态入库闭环',
      focus: 'multimodal_ingest',
      node_count: 5,
      edge_count: 4,
      entry_card_id: 'multimodal-card',
      build_card_id: 'multimodal-card',
      related_cards: [
        { id: 'multimodal-card', title: '多模态入库卡' },
        { id: 'collection-topology-card', title: '集合拓扑卡' }
      ],
      nodes: [
        { type: 'image', label: '图像向量' },
        { type: 'text', label: '文本向量' },
        { type: 'pipeline', label: '入库流水线' }
      ]
    },
    {
      graph_id: 'vector-recall-loop',
      label: '召回评测闭环',
      focus: 'recall_benchmark',
      node_count: 6,
      edge_count: 5,
      entry_card_id: 'recall-benchmark-card',
      build_card_id: 'recall-benchmark-card',
      related_cards: [
        { id: 'recall-benchmark-card', title: '召回评测卡' },
        { id: 'metadata-filter-card', title: '元数据过滤卡' }
      ],
      nodes: [
        { type: 'benchmark', label: '评测集' },
        { type: 'recall', label: '召回命中' },
        { type: 'score', label: '质量评分' }
      ]
    }
  ]
})
