export interface DetailBlock {
  type: 'filter' | 'transform' | 'calc' | 'join' | 'output';
  icon: string;
  name: string;
  desc: string;
  code: string;
}

export interface ProcessDetail {
  title: string;
  body: string;
  blocks: DetailBlock[];
}

export const processDetails: Record<string, ProcessDetail> = {
  'field-input': {
    title: '田间传感数据 — 物联网接入源',
    body: '<p>通过物联网网关实时接入<strong>田间多源传感数据</strong>，包括土壤湿度、温度、光照强度、气象站数据及无人机遥感影像元数据。</p>',
    blocks: [
      {
        type: 'output',
        icon: 'P',
        name: '物联网接入配置',
        desc: '田间传感数据实时接入',
        code: `<span class="cm">// 田间传感数据 IoT 接入</span>
{
  <span class="str">"source_type"</span>: <span class="str">"iot_stream"</span>,
  <span class="str">"endpoint"</span>: <span class="str">"/api/field/sensors/stream"</span>,
  <span class="str">"format"</span>: <span class="str">"json"</span>,
  <span class="str">"fields"</span>: [
    <span class="str">"device_id"</span>,
    <span class="str">"soil_moisture"</span>,
    <span class="str">"soil_temperature"</span>,
    <span class="str">"air_temperature"</span>,
    <span class="str">"humidity"</span>,
    <span class="str">"light_intensity"</span>,
    <span class="str">"wind_speed"</span>,
    <span class="str">"rainfall"</span>,
    <span class="str">"timestamp"</span>,
    <span class="str">"geo_location"</span>
  ]
}`,
      },
    ],
  },
  'field-filter': {
    title: '田间传感数据 — 数据清洗',
    body: '<p>一体化执行<strong>多维数据质量清洗</strong>：剔除设备故障导致的异常值（传感器读数越界）、空值处理（通信中断缺失）、时间戳乱序修正，并完成<strong>噪声平滑</strong>与<strong>设备漂移校准</strong>。128,640 条 → 119,832 条，剔除 8,808 条脏数据（6.8%）。</p>',
    blocks: [
      {
        type: 'filter',
        icon: 'F',
        name: '数据清洗控件',
        desc: '异常值 / 空值 / 噪声平滑 / 设备故障剔除',
        code: `<span class="cm">// 田间传感 - 数据清洗</span>
{
  <span class="str">"source"</span>: <span class="str">"field_sensors"</span>,
  <span class="str">"input_count"</span>: <span class="num">128640</span>,
  <span class="str">"rules"</span>: [
    { <span class="str">"field"</span>: <span class="str">"soil_moisture"</span>, <span class="str">"op"</span>: <span class="str">"range"</span>, <span class="str">"min"</span>: <span class="num">0</span>, <span class="str">"max"</span>: <span class="num">100</span>, <span class="str">"desc"</span>: <span class="str">"土壤湿度量程校验"</span> },
    { <span class="str">"field"</span>: <span class="str">"air_temperature"</span>, <span class="str">"op"</span>: <span class="str">"range"</span>, <span class="str">"min"</span>: <span class="num">-40</span>, <span class="str">"max"</span>: <span class="num">60</span>, <span class="str">"desc"</span>: <span class="str">"气温异常检测"</span> },
    { <span class="str">"field"</span>: <span class="str">"geo_location"</span>, <span class="str">"op"</span>: <span class="str">"not_null"</span>, <span class="str">"desc"</span>: <span class="str">"坐标缺失剔除"</span> },
    { <span class="str">"field"</span>: <span class="str">"device_id"</span>, <span class="str">"op"</span>: <span class="str">"valid"</span>, <span class="str">"desc"</span>: <span class="str">"设备故障剔除"</span> }
  ],
  <span class="str">"null_strategy"</span>: <span class="str">"linear_impute"</span>,
  <span class="str">"anomaly_strategy"</span>: <span class="str">"drop_row"</span>,
  <span class="str">"smooth"</span>: <span class="str">"moving_average_5"</span>,
  <span class="str">"output_count"</span>: <span class="num">119832</span>
}`,
      },
    ],
  },
  'field-map': {
    title: '田间传感数据 — 字段标准化',
    body: '<p>统一字段格式与命名，<strong>单位归一化</strong>（温度统一为摄氏度、湿度统一为百分比），完成时间戳对齐（统一到小时级采样），坐标投影转换（WGS84 → 国测局），并按省份编码聚合。119,832 条 → 119,456 条。</p>',
    blocks: [
      {
        type: 'transform',
        icon: 'T',
        name: '字段标准化控件',
        desc: '单位统一 / 时间对齐 / 坐标归一',
        code: `<span class="cm">// 田间传感 - 字段标准化</span>
{
  <span class="str">"mapping"</span>: {
    <span class="str">"soil_temperature"</span>: <span class="str">"soil_temp_c"</span>,
    <span class="str">"air_temperature"</span>: <span class="str">"air_temp_c"</span>,
    <span class="str">"light_intensity"</span>: <span class="str">"light_lux"</span>
  },
  <span class="str">"unit_norm"</span>: {
    <span class="str">"temperature"</span>: <span class="str">"celsius"</span>,
    <span class="str">"humidity"</span>: <span class="str">"percent"</span>,
    <span class="str">"rainfall"</span>: <span class="str">"mm"</span>
  },
  <span class="str">"time_norm"</span>: { <span class="str">"granularity"</span>: <span class="str">"hour"</span>, <span class="str">"timezone"</span>: <span class="str">"Asia/Shanghai"</span> },
  <span class="str">"geo_norm"</span>: { <span class="str">"from"</span>: <span class="str">"wgs84"</span>, <span class="str">"to"</span>: <span class="str">"gcj02"</span> }
}`,
      },
    ],
  },
  'market-input': {
    title: '市场价格数据 — 多源接入源',
    body: '<p>通过 RESTful API 接入<strong>全国批发市场报价</strong>、电商平台价格、物流运价及农业政策通知，构建覆盖品种、地区、时间的多维度价格数据流。</p>',
    blocks: [
      {
        type: 'output',
        icon: 'P',
        name: '市场价格接入配置',
        desc: '批发/电商/物流/政策多源接入',
        code: `<span class="cm">// 市场价格数据接入</span>
{
  <span class="str">"source_type"</span>: <span class="str">"multi_api"</span>,
  <span class="str">"sources"</span>: [
    { <span class="str">"name"</span>: <span class="str">"wholesale_market"</span>, <span class="str">"endpoint"</span>: <span class="str">"/api/price/wholesale"</span> },
    { <span class="str">"name"</span>: <span class="str">"ecommerce"</span>, <span class="str">"endpoint"</span>: <span class="str">"/api/price/ecommerce"</span> },
    { <span class="str">"name"</span>: <span class="str">"logistics"</span>, <span class="str">"endpoint"</span>: <span class="str">"/api/logistics/price"</span> }
  ],
  <span class="str">"fields"</span>: [<span class="str">"province"</span>, <span class="str">"city"</span>, <span class="str">"variety"</span>, <span class="str">"price"</span>, <span class="str">"volume"</span>, <span class="str">"date"</span>]
}`,
      },
    ],
  },
  'market-filter': {
    title: '市场价格数据 — 数据清洗',
    body: '<p>一体化执行<strong>价格数据质量清洗</strong>：重复报价去重（同一市场同品种同日取最新）、异常价格检测（偏离历史均值 3σ 视为异常）、缺失日期前向填补，并剔除非农产品异常品类。86,400 条 → 81,248 条。</p>',
    blocks: [
      {
        type: 'filter',
        icon: 'F',
        name: '数据清洗控件',
        desc: '重复报价去重 / 异常价格过滤 / 缺失填补',
        code: `<span class="cm">// 市场价格 - 数据清洗</span>
{
  <span class="str">"source"</span>: <span class="str">"market_price"</span>,
  <span class="str">"input_count"</span>: <span class="num">86400</span>,
  <span class="str">"rules"</span>: [
    { <span class="str">"field"</span>: <span class="str">"price"</span>, <span class="str">"op"</span>: <span class="str">"range"</span>, <span class="str">"min"</span>: <span class="num">0.01</span>, <span class="str">"max"</span>: <span class="num">9999</span>, <span class="str">"desc"</span>: <span class="str">"价格非负校验"</span> },
    { <span class="str">"field"</span>: <span class="str">"price"</span>, <span class="str">"op"</span>: <span class="str">"zscore"</span>, <span class="str">"threshold"</span>: <span class="num">3</span>, <span class="str">"desc"</span>: <span class="str">"3σ 异常价格过滤"</span> },
    { <span class="str">"field"</span>: <span class="str">"variety"</span>, <span class="str">"op"</span>: <span class="str">"in"</span>, <span class="str">"set"</span>: <span class="str">"agri_variety_whitelist"</span>, <span class="str">"desc"</span>: <span class="str">"品种白名单过滤"</span> }
  ],
  <span class="str">"dedup"</span>: { <span class="str">"keys"</span>: [<span class="str">"market"</span>, <span class="str">"variety"</span>, <span class="str">"date"</span>], <span class="str">"strategy"</span>: <span class="str">"latest"</span> },
  <span class="str">"output_count"</span>: <span class="num">81248</span>
}`,
      },
    ],
  },
  'market-map': {
    title: '市场价格数据 — 字段标准化',
    body: '<p>统一品种编码（如将"西红柿/番茄/洋柿子"映射为标准编码）、地区编码映射（市场名称 → 省市区标准编码）、量价单位规整（元/公斤），并填充周末缺失报价。81,248 条 → 80,736 条。</p>',
    blocks: [
      {
        type: 'transform',
        icon: 'T',
        name: '字段标准化控件',
        desc: '品种编码统一 / 地区编码映射 / 量价规整',
        code: `<span class="cm">// 市场价格 - 字段标准化</span>
{
  <span class="str">"variety_mapping"</span>: {
    <span class="str">"西红柿"</span>: <span class="str">"VEG001"</span>,
    <span class="str">"番茄"</span>: <span class="str">"VEG001"</span>,
    <span class="str">"洋柿子"</span>: <span class="str">"VEG001"</span>,
    <span class="str">"黄瓜"</span>: <span class="str">"VEG002"</span>
  },
  <span class="str">"region_mapping"</span>: { <span class="str">"source"</span>: <span class="str">"market_name"</span>, <span class="str">"target"</span>: [<span class="str">"province_code"</span>, <span class="str">"city_code"</span>] },
  <span class="str">"price_norm"</span>: { <span class="str">"unit"</span>: <span class="str">"yuan/kg"</span>, <span class="str">"precision"</span>: <span class="num">2</span> },
  <span class="str">"fill_missing"</span>: { <span class="str">"method"</span>: <span class="str">"forward_fill"</span>, <span class="str">"max_gap"</span>: <span class="num">2</span> }
}`,
      },
    ],
  },
  join: {
    title: '时空 JOIN 多源精准融合',
    body: '<p>以<strong>省份编码 + 时间窗口</strong>为关联主键，设置 <strong>1 小时时间匹配阈值</strong>，采用 nearest 最近邻策略将田间传感数据与市场价格数据进行时空对齐。田间流 119,456 条 × 价格流 80,736 条 → 匹配合并 <strong>96,384 条</strong>融合记录，匹配率 80.7%。未匹配记录用于后续质量报告。</p>',
    blocks: [
      {
        type: 'join',
        icon: 'J',
        name: '时空 JOIN 融合控件',
        desc: '省份+时间窗口精准对齐 · 96,384 条融合',
        code: `<span class="cm">// 时空 JOIN 融合 - 配置</span>
{
  <span class="str">"join_type"</span>: <span class="str">"inner"</span>,
  <span class="str">"left_stream"</span>: <span class="str">"field_normalized"</span>,
  <span class="str">"right_stream"</span>: <span class="str">"market_normalized"</span>,
  <span class="str">"join_keys"</span>: [<span class="str">"province_code"</span>, <span class="str">"hour_bucket"</span>],
  <span class="str">"tolerance_hours"</span>: <span class="num">1</span>,
  <span class="str">"time_alignment"</span>: {
    <span class="str">"strategy"</span>: <span class="str">"nearest"</span>,
    <span class="str">"clock_drift_compensation"</span>: <span class="kw">true</span>
  },
  <span class="str">"match_statistics"</span>: {
    <span class="str">"left_input"</span>: <span class="num">119456</span>,
    <span class="str">"right_input"</span>: <span class="num">80736</span>,
    <span class="str">"matched_output"</span>: <span class="num">96384</span>,
    <span class="str">"match_rate"</span>: <span class="str">"80.7%"</span>
  }
}`,
      },
    ],
  },
  quality: {
    title: '融合质量检查',
    body: '<p>对融合后的数据进行<strong>完整性校验</strong>（关键字段非空率）、<strong>一致性校验</strong>（同一省份同一时间的田间数据与价格数据逻辑匹配）、<strong>时序连续性校验</strong>（无异常跳变），剔除低质量融合记录。96,384 条 → 87,416 条。</p>',
    blocks: [
      {
        type: 'filter',
        icon: 'Q',
        name: '融合质量检查控件',
        desc: '完整性 / 一致性 / 时序连续性校验',
        code: `<span class="cm">// 融合质量检查 - 配置</span>
{
  <span class="str">"input_count"</span>: <span class="num">96384</span>,
  <span class="str">"checks"</span>: [
    { <span class="str">"type"</span>: <span class="str">"completeness"</span>, <span class="str">"fields"</span>: [<span class="str">"province_code"</span>, <span class="str">"variety"</span>, <span class="str">"price"</span>, <span class="str">"soil_temp_c"</span>], <span class="str">"threshold"</span>: <span class="num">0.95</span> },
    { <span class="str">"type"</span>: <span class="str">"consistency"</span>, <span class="str">"rule"</span>: <span class="str">"price > 0 when volume > 0"</span> },
    { <span class="str">"type"</span>: <span class="str">"temporal"</span>, <span class="str">"max_gap_hours"</span>: <span class="num">6</span> }
  ],
  <span class="str">"output_count"</span>: <span class="num">87416</span>
}`,
      },
    ],
  },
  db: {
    title: '农业数据仓库',
    body: '<p>将融合后的 <strong>87,416 条</strong>高质量农业数据<strong>持久化入库</strong>，沉淀为标准化农产品产销数据集。与决策接口发布并行执行。</p>',
    blocks: [
      {
        type: 'output',
        icon: 'D',
        name: '数据入库控件',
        desc: '标准化持久化存储 · 87,416 条',
        code: `<span class="cm">// 农业数据仓库 - 配置</span>
{
  <span class="str">"target"</span>: <span class="str">"t_agri_fusion_dataset"</span>,
  <span class="str">"write_mode"</span>: <span class="str">"append"</span>,
  <span class="str">"batch_size"</span>: <span class="num">2000</span>,
  <span class="str">"record_count"</span>: <span class="num">87416</span>,
  <span class="str">"indexes"</span>: [<span class="str">"province_code"</span>, <span class="str">"variety"</span>, <span class="str">"hour_bucket"</span>],
  <span class="str">"retention_days"</span>: <span class="num">730</span>
}`,
      },
    ],
  },
  api: {
    title: '决策接口发布',
    body: '<p>对外发布标准化 RESTful API，为价格预测、风险预警、辅助决策等下游应用提供<strong>稳定数据调用支撑</strong>。与数据入库<strong>并行执行</strong>，确保数据持久化与接口可用性同步就绪。</p>',
    blocks: [
      {
        type: 'output',
        icon: 'A',
        name: '决策接口发布控件',
        desc: 'RESTful API 发布 · 与入库并行',
        code: `<span class="cm">// 决策接口发布 - 配置</span>
{
  <span class="str">"api_name"</span>: <span class="str">"agri-decision-api"</span>,
  <span class="str">"version"</span>: <span class="str">"v1"</span>,
  <span class="str">"record_count"</span>: <span class="num">87416</span>,
  <span class="str">"execution"</span>: <span class="str">"parallel_with_db"</span>,
  <span class="str">"endpoints"</span>: [
    { <span class="str">"method"</span>: <span class="str">"GET"</span>, <span class="str">"path"</span>: <span class="str">"/api/v1/agri/latest"</span>, <span class="str">"desc"</span>: <span class="str">"获取最新融合数据"</span> },
    { <span class="str">"method"</span>: <span class="str">"POST"</span>, <span class="str">"path"</span>: <span class="str">"/api/v1/agri/query"</span>, <span class="str">"desc"</span>: <span class="str">"按省份/品种/时间查询"</span> }
  ]
}`,
      },
    ],
  },
};
