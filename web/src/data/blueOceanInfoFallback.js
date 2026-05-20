export const blueOceanInfoFallback = {
  organization: {
    name: '蓝海智询',
    logo: '/favicon.svg',
    avatar: '/avatar.jpg',
    login_bg: '/login-bg.jpg'
  },
  branding: {
    name: 'BlueOcean IQ',
    title: '蓝海智询：水生动物疾病知识问答平台',
    subtitle: '面向病-药-环知识图谱、RAG 检索增强、动态问诊与环境预警的一体化前端工作台',
    description:
      '平台围绕水生动物疾病场景组织宿主、病原、药物、环境指标和监测记录等知识资产，通过知识图谱、混合检索和可解释问答打通“监测 - 诊断 - 决策”闭环。'
  },
  features: [
    {
      label: '知识底座',
      value: '病-药-环三元图谱',
      description: '把宿主、病害、药物、环境指标和防治依据统一组织进图谱关系网络，突出领域知识的可追溯结构。',
      icon: 'stars'
    },
    {
      label: '智能诊断',
      value: '动态问诊 + RAG',
      description: '围绕症状文本、图片观察和环境监测值组织多轮问诊与证据召回，提升病害初筛的可信度。',
      icon: 'resolved'
    },
    {
      label: '检索体系',
      value: '混合索引与命名空间',
      description: '按病害、宿主、规范和案例分层管理向量集合，支持 BM25 + 向量检索联动与 metadata 过滤。',
      icon: 'commits'
    },
    {
      label: '预警能力',
      value: '48h 环境风险预警',
      description: '把海温、盐度、氨氮和历史病害案例组织进预警视角，为养殖场提供更早一步的风险提示。',
      icon: 'license'
    }
  ],
  themes: [
    {
      id: 'fish-atlas',
      name: '病-药-环知识图谱',
      subtitle: 'Disease Graph',
      description:
        '围绕宿主、病原、药物、环境因子和防治依据构建水生动物疾病知识图谱，强调知识网络、引用依据与病害机制之间的联动展示。',
      status: 'Knowledge Graph',
      featured: true,
      entry_route: '/themes/fish-atlas',
      tags: ['病-药-环', '宿主关系', '防治依据', '知识图谱'],
      highlights: [
        '用宿主、病原、症状、用药和环境五类节点组织疾病知识主线，形成病-药-环技术路线。',
        '支持图谱关系、实体详情、证据来源和病害链路的统一浏览。',
        '为后续 RAG 问答和环境预警提供统一的结构化知识入口。'
      ],
      context: {
        theme: 'fish-atlas',
        module: 'fish-atlas',
        scene: 'overview',
        version: 'blueocean-v2'
      },
      links: {
        docs: 'https://github.com/GodCzy/buleocean'
      },
      entry_points: [
        { name: '模块总览', type: 'route', route: '/themes/fish-atlas' },
        { name: '知识路径工作台', type: 'route', route: '/knowledge/fish-atlas' },
        { name: '图谱展示页', type: 'route', route: '/graph' }
      ]
    },
    {
      id: 'rag-lab',
      name: '动态问诊与 RAG 问答',
      subtitle: 'Diagnostic RAG',
      description:
        '围绕症状文本、图片观察、环境指标和多轮追问组织智能问诊工作台，把召回证据、问题改写和回答 grounding 放进同一套前端界面。',
      status: 'Diagnostic Workflow',
      featured: false,
      entry_route: '/themes/rag-lab',
      tags: ['动态问诊', '多轮追问', '证据回答', 'Grounding'],
      highlights: [
        '采用有限状态机驱动问诊思路，把“先问清、再召回、后回答”的流程显式呈现。',
        '支持症状、环境、检索计划、证据命中和回答边界的结构化表达。',
        '与知识图谱和向量检索共用同一批疾病知识资产，形成统一产品语言。'
      ],
      context: {
        theme: 'rag-lab',
        module: 'rag-lab',
        scene: 'overview',
        version: 'blueocean-v2'
      },
      links: {
        docs: 'https://github.com/GodCzy/buleocean'
      },
      entry_points: [
        { name: '模块总览', type: 'route', route: '/themes/rag-lab' },
        { name: '知识路径工作台', type: 'route', route: '/knowledge/rag-lab' },
        { name: '问答工作台', type: 'route', route: '/agent' }
      ]
    },
    {
      id: 'vector-vault',
      name: '监测预警与向量检索',
      subtitle: 'Retrieval & Alerting',
      description:
        '围绕混合检索、命名空间管理、召回评测和环境病害预警组织底层能力展示，突出知识库基础设施如何支撑上层问答与风险研判。',
      status: 'Infrastructure & Alert',
      featured: false,
      entry_route: '/themes/vector-vault',
      tags: ['FAISS+BM25', '命名空间', '召回评测', '48h 预警'],
      highlights: [
        '把混合索引、向量管理和环境预警能力整合成可运维的控制台视图。',
        '支持集合分层、metadata filter、检索评测和预警命中的统一管理。',
        '和动态问诊页面形成上下游关系，说明底层检索如何影响最终回答质量。'
      ],
      context: {
        theme: 'vector-vault',
        module: 'vector-vault',
        scene: 'overview',
        version: 'blueocean-v2'
      },
      links: {
        docs: 'https://github.com/GodCzy/buleocean'
      },
      entry_points: [
        { name: '模块总览', type: 'route', route: '/themes/vector-vault' },
        { name: '知识路径工作台', type: 'route', route: '/knowledge/vector-vault' },
        { name: '索引与评测页', type: 'route', route: '/database' }
      ]
    }
  ],
  actions: [
    {
      name: '模块总览',
      icon: 'docs',
      url: '/themes'
    },
    {
      name: '问答工作台',
      icon: 'route',
      url: '/agent'
    },
    {
      name: '图谱展示页',
      icon: 'route',
      url: '/graph'
    }
  ],
  footer: {
    copyright: '© 蓝海智询 2026',
    user_agreement_url: '/protocols/user-agreement.template.html',
    privacy_policy_url: '/protocols/privacy-policy.template.html'
  }
}
