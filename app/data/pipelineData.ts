export interface PipelineNodeData {
  id: string;
  label: string;
  sub: string;
  tag?: string;
  inputCount: number;
  outputCount: number;
}

export interface PipelineRowData {
  id: string;
  stream: 'a' | 'b';
  label: string;
  color: string;
  nodes: PipelineNodeData[];
}

export interface MergedNodeData extends PipelineNodeData {
  stream: 'merge' | 'out';
}

export const pipelineRows: PipelineRowData[] = [
  {
    id: 'field',
    stream: 'a',
    label: '田间传感数据',
    color: 'var(--accent)',
    nodes: [
      {
        id: 'field-input',
        label: '田间传感数据',
        sub: '物联网实时接入源',
        tag: '源',
        inputCount: 128640,
        outputCount: 128640,
      },
      {
        id: 'field-filter',
        label: '数据清洗',
        sub: '异常值/空值/噪声平滑 · 设备故障剔除',
        inputCount: 128640,
        outputCount: 119832,
      },
      {
        id: 'field-map',
        label: '字段标准化',
        sub: '单位统一 · 时间对齐 · 坐标归一',
        inputCount: 119832,
        outputCount: 119456,
      },
    ],
  },
  {
    id: 'market',
    stream: 'b',
    label: '市场价格数据',
    color: 'var(--cyan)',
    nodes: [
      {
        id: 'market-input',
        label: '市场价格数据',
        sub: '批发/电商/物流多源接入',
        tag: '源',
        inputCount: 86400,
        outputCount: 86400,
      },
      {
        id: 'market-filter',
        label: '数据清洗',
        sub: '重复报价去重 · 异常价格过滤 · 缺失填补',
        inputCount: 86400,
        outputCount: 81248,
      },
      {
        id: 'market-map',
        label: '字段标准化',
        sub: '品种编码统一 · 地区编码映射 · 量价规整',
        inputCount: 81248,
        outputCount: 80736,
      },
    ],
  },
];

export const mergedNodes: MergedNodeData[] = [
  {
    id: 'join',
    label: '时空 JOIN 融合',
    sub: '省份+时间窗口精准对齐',
    tag: '核心',
    stream: 'merge',
    inputCount: 200192,
    outputCount: 96384,
  },
  {
    id: 'quality',
    label: '融合质量检查',
    sub: '完整性 / 一致性 / 时序连续性校验',
    stream: 'merge',
    inputCount: 96384,
    outputCount: 87416,
  },
  {
    id: 'db',
    label: '农业数据仓库',
    sub: '标准化持久化',
    stream: 'out',
    inputCount: 87416,
    outputCount: 87416,
  },
  {
    id: 'api',
    label: '决策接口发布',
    sub: 'RESTful API 支撑下游决策',
    stream: 'out',
    inputCount: 87416,
    outputCount: 87416,
  },
];
