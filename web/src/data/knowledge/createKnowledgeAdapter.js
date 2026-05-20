const defaultShowcaseMeta = {
  eyebrow: '知识路径入口',
  title: '推荐路径与图谱闭环',
  description: '先看摘要，再按需展开证据、图谱节点与后续动作。',
  stats: {
    cards: '知识卡片',
    recommendations: '推荐路径',
    graphs: '图谱闭环'
  },
  recommendationTitle: '知识路径',
  recommendationDescription: '每条路径都保留摘要、证据和上下文，方便继续追问。',
  graphTitle: '图谱闭环',
  graphDescription: '图谱侧保留关系摘要，便于理解路径背后的结构。',
  recommendationActionLabel: '写入路径上下文',
  recommendationChatLabel: '带此路径继续问答',
  graphActionLabel: '写入图谱上下文',
  graphAdminLabel: '进入图谱页',
  graphUserLabel: '带此图谱继续问答'
}

const defaultBranchPresets = [
  {
    tone: 'calm',
    branchTone: '稳态主线',
    riskLabel: '低风险',
    costLabel: '低成本',
    confidenceLabel: '适合先看全局'
  },
  {
    tone: 'focus',
    branchTone: '聚焦主线',
    riskLabel: '中风险',
    costLabel: '中成本',
    confidenceLabel: '适合深入推演'
  },
  {
    tone: 'peak',
    branchTone: '扩展主线',
    riskLabel: '中高风险',
    costLabel: '中高成本',
    confidenceLabel: '适合扩展分析'
  }
]

const cloneItems = (items = []) => items.map((item) => ({ ...item }))

const summarizeQuestion = (question = '', fallback = '', limit = 48) => {
  const normalized = typeof question === 'string' ? question.trim() : ''
  const value = normalized || fallback
  return value.length > limit ? `${value.slice(0, limit - 1)}...` : value
}

const createTreeData = (branches = [], rootQuestion = '', rootMeta = '查询起点') => {
  const rootNode = {
    id: 'root-question',
    type: 'root',
    title: '起始问题',
    subtitle: summarizeQuestion(rootQuestion, '', 42),
    meta: rootMeta,
    x: 120,
    y: 280,
    radius: 10,
    branchId: ''
  }

  const nodes = [rootNode]
  const edges = []

  branches.forEach((branch, index) => {
    const branchY = 140 + index * 160
    const branchNode = {
      id: branch.id,
      type: 'branch',
      title: branch.title,
      subtitle: branch.subtitle,
      meta: `${branch.branchTone} / ${branch.riskLabel}`,
      x: 420,
      y: branchY,
      radius: 9,
      branchId: branch.id,
      tone: branch.tone
    }

    const nextNode = {
      id: `${branch.id}-next`,
      type: 'next-step',
      title: '继续推演',
      subtitle: branch.nextStepSubtitle,
      meta: branch.confidenceLabel,
      x: 760,
      y: branchY,
      radius: 8,
      branchId: branch.id,
      tone: branch.tone
    }

    nodes.push(branchNode, nextNode)
    edges.push(
      {
        id: `edge-root-${branch.id}`,
        source: rootNode.id,
        target: branch.id,
        branchId: branch.id,
        kind: index === 0 ? 'primary' : 'secondary',
        label: branch.choiceLabel,
        isHighlighted: index === 0
      },
      {
        id: `edge-next-${branch.id}`,
        source: branch.id,
        target: nextNode.id,
        branchId: branch.id,
        kind: index === 0 ? 'primary' : 'guide',
        label: '继续',
        isHighlighted: index === 0
      }
    )
  })

  return {
    width: 1080,
    height: Math.max(560, 220 + branches.length * 160),
    nodes,
    edges
  }
}

export const createKnowledgeAdapter = (config = {}) => {
  const {
    id,
    themeName,
    defaultQuestion,
    version = 'blueocean-v1',
    manifestSummary = { card_count: 0 },
    cardTitleMap = {},
    labelMap = {},
    recommendationCandidates = [],
    graphLoops = [],
    showcaseMeta = {},
    branchPresets = defaultBranchPresets,
    stageLabel = '知识模块',
    stageTitle = '先锁定知识主线，再继续展开路径',
    stageSubtitle = '每条路径都会把图谱、证据和上下文一起推进。',
    workspaceHint = '先选一条主线，再把它带入问答或图谱视角。',
    routeTone = '围绕当前主路径组织知识，适合继续追问和关系梳理。',
    rootMeta = '平台输入'
  } = config

  const getDisplayLabel = (value = '') => labelMap[value] || value || ''
  const getCardTitleById = (cardId = '') => cardTitleMap[cardId] || cardId || ''
  const getManifestSummary = () => ({ ...manifestSummary })

  const getRecommendationCandidates = () =>
    recommendationCandidates.map((item) => ({
      ...item,
      why_selected: [...(item.why_selected || [])],
      next_card_items: cloneItems(item.next_card_items),
      filters: { ...(item.filters || {}) }
    }))

  const getRecommendationCandidateById = (candidateId = '') =>
    recommendationCandidates.find((item) => item.candidate_id === candidateId) || null

  const getGraphLoops = () =>
    graphLoops.map((item) => ({
      ...item,
      related_cards: cloneItems(item.related_cards),
      nodes: cloneItems(item.nodes)
    }))

  const getGraphLoopById = (graphId = '') =>
    graphLoops.find((item) => item.graph_id === graphId) || null

  const getGraphDefaultKeyword = (graphLoopOrGraphId = '') => {
    const graphLoop =
      graphLoopOrGraphId && typeof graphLoopOrGraphId === 'object'
        ? graphLoopOrGraphId
        : getGraphLoopById(graphLoopOrGraphId)

    if (!graphLoop) return ''

    return (
      getDisplayLabel(graphLoop.focus || '') ||
      graphLoop.nodes?.find((node) => node.label)?.label ||
      graphLoop.label ||
      ''
    )
  }

  const getCandidateDisplayLabels = (candidate) => {
    const filters = candidate?.filters || {}
    return [
      filters.experience_level,
      filters.budget_level,
      ...(filters.playstyle || []).slice(0, 2),
      ...(filters.content_goals || []).slice(0, 1)
    ]
      .filter(Boolean)
      .map((item) => getDisplayLabel(item))
  }

  const createRecommendationContext = (candidate) => ({
    theme: id,
    module: id,
    scene: candidate?.next_scene || 'overview',
    version,
    focus: candidate?.candidate_id || '',
    candidate: candidate?.candidate_id || '',
    graph: candidate?.graph_loop_id || '',
    build: candidate?.build_card_id || '',
    entry: 'recommendation'
  })

  const createGraphContext = (graphLoop) => ({
    theme: id,
    module: id,
    scene: 'graph_loop',
    version,
    focus: graphLoop?.focus || graphLoop?.graph_id || '',
    graph: graphLoop?.graph_id || '',
    build: graphLoop?.build_card_id || '',
    entry: 'graph'
  })

  const resolvedShowcaseMeta = {
    ...defaultShowcaseMeta,
    ...showcaseMeta,
    stats: {
      ...defaultShowcaseMeta.stats,
      ...(showcaseMeta.stats || {})
    }
  }

  const getThemeShowcaseMeta = () => ({
    ...resolvedShowcaseMeta,
    stats: { ...resolvedShowcaseMeta.stats }
  })

  const getThemeShowcaseCandidates = () =>
    recommendationCandidates.map((candidate) => ({
      id: candidate.candidate_id,
      title: candidate.title,
      subtitle: candidate.build_title || getCardTitleById(candidate.build_card_id),
      badge: getDisplayLabel(candidate.next_scene) || '知识路径',
      labels: getCandidateDisplayLabels(candidate),
      reasons: [...(candidate.why_selected || [])],
      relatedItems: cloneItems(candidate.next_card_items),
      context: createRecommendationContext(candidate)
    }))

  const getThemeShowcaseGraphs = () =>
    graphLoops.map((graphLoop) => ({
      id: graphLoop.graph_id,
      title: graphLoop.label,
      subtitle: getCardTitleById(graphLoop.entry_card_id),
      badge: `${graphLoop.node_count} 节点 / ${graphLoop.edge_count} 关系`,
      focusLabel: getDisplayLabel(graphLoop.focus),
      nodePreview: (graphLoop.nodes || []).slice(0, 4).map((node) => `${node.type}: ${node.label}`),
      relatedItems: cloneItems(graphLoop.related_cards),
      context: createGraphContext(graphLoop)
    }))

  const getAgentContextView = (activeContext = {}) => {
    const candidate = getRecommendationCandidateById(activeContext?.candidate || '')
    const graphLoop = getGraphLoopById(activeContext?.graph || '')

    const candidateSummary = candidate
      ? {
          key: `candidate:${candidate.candidate_id}`,
          label: '当前路径',
          title: candidate.title,
          description: `系统当前围绕 ${candidate.build_title || getCardTitleById(candidate.build_card_id)} 继续组织回答上下文。`
        }
      : null

    const graphSummary = graphLoop
      ? {
          key: `graph:${graphLoop.graph_id}`,
          label: '当前图谱',
          title: graphLoop.label,
          description: `当前图谱焦点为 ${getDisplayLabel(graphLoop.focus)}，可继续沿这条关系链追问。`
        }
      : null

    const prompts = candidate
      ? [
          `为什么“${candidate.title}”最适合作为当前问题的知识路径？`,
          `沿着“${candidate.build_title || candidate.title}”继续问时，应该优先追哪一段证据？`,
          `如果继续沿这条路径追问，最值得强调的图谱关系是什么？`
        ]
      : [
          '这个模块最适合从哪条知识路径开始？',
          '图谱关系和问答证据之间应该如何衔接？',
          '哪一组结果最适合作为当前问题的第一批证据？'
        ]

    return {
      candidateSummary,
      graphSummary,
      welcomePanel: {
        title: candidate ? `继续沿“${candidate.title}”追问` : `进入 ${themeName} 问答上下文`,
        description: candidate
          ? `系统已经带入 ${candidate.build_title || candidate.title} 的路径、图谱和证据摘要，可直接继续追问。`
          : '当前模块会把路径、图谱与证据链一起组织为可继续问答的上下文。',
        prompts
      }
    }
  }

  const createEvidenceRefs = (candidate, graphLoop) => {
    const evidence = []

    if (candidate?.build_card_id) {
      evidence.push({
        id: candidate.build_card_id,
        title: getCardTitleById(candidate.build_card_id),
        type: 'knowledge_card',
        typeLabel: '主知识卡',
        summary: '这张卡片概括了当前路径最核心的知识组织视角。'
      })
    }

    for (const item of candidate?.next_card_items || []) {
      evidence.push({
        id: item.id,
        title: item.title,
        type: 'support_card',
        typeLabel: '关联证据',
        summary: '这条证据用于补齐当前路径继续展开时最关键的上下文。'
      })
    }

    for (const item of graphLoop?.related_cards || []) {
      evidence.push({
        id: item.id,
        title: item.title,
        type: 'graph_card',
        typeLabel: '图谱关系',
        summary: '这条图谱关系说明当前路径在知识网络中的结构位置。'
      })
    }

    return evidence.slice(0, 6)
  }

  const createNextActions = (candidate, graphLoop) => [
    {
      id: `${candidate.candidate_id}-continue`,
      label: '继续沿此路径展开',
      description: '保留当前路径、图谱和证据，再生成下一层知识内容。',
      targetType: 'continue',
      emphasis: 'primary'
    },
    {
      id: `${candidate.candidate_id}-chat`,
      label: '带着这条路径继续问答',
      description: '把当前路径上下文交给问答视图，继续追问细节与结论。',
      targetType: 'chat',
      emphasis: 'secondary'
    },
    {
      id: `${candidate.candidate_id}-graph`,
      label: '查看对应图谱闭环',
      description: graphLoop
        ? `进入 ${graphLoop.label}，查看这条路径对应的图谱关系摘要。`
        : '进入图谱视图，查看当前路径的关系结构。',
      targetType: 'graph',
      emphasis: 'ghost'
    }
  ]

  const buildBaseContext = (candidate, themeContext = {}) => ({
    ...themeContext,
    theme: id,
    module: id,
    scene: candidate.next_scene,
    version,
    focus: candidate.candidate_id,
    candidate: candidate.candidate_id,
    graph: candidate.graph_loop_id,
    build: candidate.build_card_id,
    entry: 'knowledgePath-base'
  })

  const buildBranches = (question = '', themeContext = {}) =>
    recommendationCandidates.map((candidate, index) => {
      const graphLoop = getGraphLoopById(candidate.graph_loop_id)
      const preset = branchPresets[index] || branchPresets[branchPresets.length - 1] || defaultBranchPresets[0]

      return {
        id: candidate.candidate_id,
        title: candidate.title,
        subtitle: candidate.build_title || getCardTitleById(candidate.build_card_id),
        summary:
          (candidate.why_selected || []).join(' ') ||
          `${themeName} 会把“${summarizeQuestion(question, defaultQuestion, 36)}”展开成一条可继续问答的知识路径。`,
        branchTone: candidate.branchTone || preset.branchTone,
        riskLabel: candidate.riskLabel || preset.riskLabel,
        costLabel: candidate.costLabel || preset.costLabel,
        confidenceLabel: candidate.confidenceLabel || preset.confidenceLabel,
        routeTone: candidate.routeTone || routeTone,
        tone: candidate.tone || preset.tone,
        choiceLabel: getDisplayLabel(candidate.next_scene),
        suitability: getCandidateDisplayLabels(candidate),
        focus: candidate.next_scene,
        focusKey: candidate.candidate_id,
        candidateId: candidate.candidate_id,
        graphId: candidate.graph_loop_id,
        buildId: candidate.build_card_id,
        graphLabel: graphLoop?.label || '知识图谱',
        buildLabel: candidate.build_title || getCardTitleById(candidate.build_card_id),
        choiceReason:
          (candidate.why_selected || [])[0] || `${themeName} 优先给出了一条适合当前问题的知识路径。`,
        switchHint: candidate.switchHint || '可以随时切换到其他路径，查看不同的组织方式。',
        evidenceRefs: createEvidenceRefs(candidate, graphLoop),
        nextStepTitle: candidate.nextStepTitle || '继续推演',
        nextStepSubtitle:
          candidate.nextStepSubtitle || `继续围绕“${candidate.title}”补齐下一层证据和图谱上下文。`,
        nextGenerationLabel: candidate.nextGenerationLabel || '继续生成下一层路径',
        nextActions: createNextActions(candidate, graphLoop),
        context: buildBaseContext(candidate, themeContext)
      }
    })

  const buildKnowledgePath = (question, themeContext = {}, options = {}) => {
    const normalizedQuestion =
      typeof question === 'string' && question.trim() ? question.trim() : defaultQuestion
    const generationMode = options.mode === 'focused' ? 'focused' : 'base'
    const branches = buildBranches(normalizedQuestion, themeContext)
    const activeBranchId = branches[0]?.id || ''

    return {
      themeId: id,
      moduleId: id,
      rootQuestion: normalizedQuestion,
      questionDraft: normalizedQuestion,
      generatedAt: new Date().toISOString(),
      status: 'ready',
      sourceType: generationMode === 'focused' ? `${id}-focus-v1` : `${id}-base-v1`,
      generationMode,
      generationRound: generationMode === 'focused' ? 2 : 1,
      branches,
      activeBranchId,
      selectedNodeId: activeBranchId,
      tree: createTreeData(branches, normalizedQuestion, rootMeta),
      viewState: {
        lastGeneratedFrom: generationMode === 'focused' ? 'focus-generate' : 'base-generate',
        protocolVersion: 'blueocean-v1'
      },
      displayMeta: {
        stageLabel,
        stageTitle,
        stageSubtitle,
        branchCount: branches.length,
        themeName,
        generationLabel: '生成知识路径',
        generationMode,
        workspaceHint
      }
    }
  }

  return {
    id,
    defaultQuestion,
    buildKnowledgePath,
    getDisplayLabel,
    getCardTitleById,
    getManifestSummary,
    getRecommendationCandidates,
    getRecommendationCandidateById,
    getGraphLoops,
    getGraphLoopById,
    getGraphDefaultKeyword,
    getThemeShowcaseMeta,
    getThemeShowcaseCandidates,
    getThemeShowcaseGraphs,
    getAgentContextView
  }
}
