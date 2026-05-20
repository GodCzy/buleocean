import { createKnowledgeAdapter } from '@/data/knowledge/createKnowledgeAdapter'

export const fishAtlasKnowledgePathAdapter = createKnowledgeAdapter({
  id: 'fish-atlas',
  themeName: '病-药-环知识图谱',
  defaultQuestion: '如果我要快速判断石斑鱼疑似寄生虫问题与环境诱因之间的关系，应该先从哪条知识路径开始？',
  version: 'blueocean-v1',
  manifestSummary: {
    card_count: 9
  },
  cardTitleMap: {
    'host-profile-card': '宿主画像卡',
    'symptom-clue-card': '症状线索卡',
    'pathogen-card': '病原识别卡',
    'drug-plan-card': '药物处置卡',
    'environment-trigger-card': '环境诱因卡',
    'monitoring-card': '监测指标卡'
  },
  labelMap: {
    host_profile: '宿主画像',
    symptom_trace: '症状追踪',
    disease_link: '病害关联',
    drug_plan: '处置建议',
    environment_trigger: '环境诱因',
    graph_ready: '图谱优先',
    citation_ready: '证据可引',
    monitoring_scene: '监测场景',
    diagnosis: '诊断分析',
    alerting: '预警联动',
    graph: '知识图谱',
    rag: '问答联动'
  },
  stageLabel: '图谱主线',
  stageTitle: '先锁定病-药-环主线，再展开证据与图谱关系',
  stageSubtitle: '每条路径都会把宿主、症状、病原、用药和环境波动组织成清晰的诊断链路。',
  workspaceHint: '先选一条病-药-环路径，再带着它进入问答或图谱视角。',
  routeTone: '围绕诊断闭环组织知识，突出病原识别、环境诱因与处置策略的关联结构。',
  showcaseMeta: {
    eyebrow: '知识图谱模块',
    title: '病-药-环主线与图谱闭环',
    description: '从宿主画像、环境诱因与病害处置三条主线切入水生动物疾病知识组织。',
    stats: {
      cards: '图谱知识卡',
      recommendations: '诊断路径',
      graphs: '关系闭环'
    },
    recommendationTitle: '图谱路径',
    recommendationDescription: '每条路径都保留图谱摘要、证据线索和后续动作。',
    graphTitle: '关系闭环',
    graphDescription: '图谱侧聚焦宿主、病原、症状、药物和环境指标之间的关系。',
    recommendationActionLabel: '写入图谱路径',
    recommendationChatLabel: '带此路径继续问答',
    graphActionLabel: '写入图谱上下文',
    graphAdminLabel: '查看图谱关系',
    graphUserLabel: '带此图谱继续问答'
  },
  recommendationCandidates: [
    {
      candidate_id: 'host-symptom-route',
      title: '先看宿主与症状',
      build_title: '宿主画像卡',
      next_scene: 'host_profile',
      graph_loop_id: 'host-symptom-loop',
      build_card_id: 'host-profile-card',
      why_selected: [
        '从宿主种类、养殖阶段和可见症状开始，最适合做首屏图谱入口，也便于老师快速理解系统主题。',
        '这条路径能自然串联症状线索、病原怀疑和环境指标，不会一开始就陷入过深的病理细节。'
      ],
      next_card_items: [
        { id: 'symptom-clue-card', title: '症状线索卡' },
        { id: 'monitoring-card', title: '监测指标卡' }
      ],
      filters: {
        experience_level: 'host_profile',
        budget_level: 'graph_ready',
        playstyle: ['monitoring_scene', 'citation_ready'],
        content_goals: ['graph']
      }
    },
    {
      candidate_id: 'environment-trigger-route',
      title: '追踪环境诱因',
      build_title: '环境诱因卡',
      next_scene: 'environment_trigger',
      graph_loop_id: 'environment-trigger-loop',
      build_card_id: 'environment-trigger-card',
      why_selected: [
        '如果展示重点是环境风险预警，这条路径最能体现氨氮、水温、溶氧等指标如何映射到疾病风险。',
        '它适合把传感器数据、48 小时波动和病害风险做成一条可解释的图谱关系链。'
      ],
      next_card_items: [
        { id: 'monitoring-card', title: '监测指标卡' },
        { id: 'pathogen-card', title: '病原识别卡' }
      ],
      filters: {
        experience_level: 'environment_trigger',
        budget_level: 'graph_ready',
        playstyle: ['monitoring_scene', 'alerting'],
        content_goals: ['graph']
      }
    },
    {
      candidate_id: 'disease-drug-route',
      title: '锁定病害与用药',
      build_title: '病原识别卡',
      next_scene: 'disease_link',
      graph_loop_id: 'disease-drug-loop',
      build_card_id: 'pathogen-card',
      why_selected: [
        '病害与用药路径最能展示“诊断-决策”部分，让系统看起来更像真实业务平台，而不是单纯知识展示页。',
        '这条路径可以把病原、症状、药物、停药期和风险提示统一收进同一条图谱闭环。'
      ],
      next_card_items: [
        { id: 'drug-plan-card', title: '药物处置卡' },
        { id: 'symptom-clue-card', title: '症状线索卡' }
      ],
      filters: {
        experience_level: 'diagnosis',
        budget_level: 'graph_ready',
        playstyle: ['citation_ready', 'alerting'],
        content_goals: ['rag']
      }
    }
  ],
  graphLoops: [
    {
      graph_id: 'host-symptom-loop',
      label: '宿主症状闭环',
      focus: 'host_profile',
      node_count: 5,
      edge_count: 4,
      entry_card_id: 'host-profile-card',
      build_card_id: 'host-profile-card',
      related_cards: [
        { id: 'host-profile-card', title: '宿主画像卡' },
        { id: 'symptom-clue-card', title: '症状线索卡' }
      ],
      nodes: [
        { type: 'host', label: '宿主实体' },
        { type: 'symptom', label: '症状特征' },
        { type: 'monitoring', label: '监测指标' }
      ]
    },
    {
      graph_id: 'environment-trigger-loop',
      label: '环境诱因闭环',
      focus: 'environment_trigger',
      node_count: 6,
      edge_count: 5,
      entry_card_id: 'environment-trigger-card',
      build_card_id: 'environment-trigger-card',
      related_cards: [
        { id: 'environment-trigger-card', title: '环境诱因卡' },
        { id: 'monitoring-card', title: '监测指标卡' }
      ],
      nodes: [
        { type: 'environment', label: '环境波动' },
        { type: 'risk', label: '风险指标' },
        { type: 'pathogen', label: '病原怀疑' }
      ]
    },
    {
      graph_id: 'disease-drug-loop',
      label: '病害处置闭环',
      focus: 'disease_link',
      node_count: 6,
      edge_count: 5,
      entry_card_id: 'pathogen-card',
      build_card_id: 'pathogen-card',
      related_cards: [
        { id: 'pathogen-card', title: '病原识别卡' },
        { id: 'drug-plan-card', title: '药物处置卡' }
      ],
      nodes: [
        { type: 'pathogen', label: '病原实体' },
        { type: 'drug', label: '药物方案' },
        { type: 'warning', label: '风险提示' }
      ]
    }
  ]
})
