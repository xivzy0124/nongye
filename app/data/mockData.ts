import { provinceAdcodeMap } from '../components/chinaAdcodeMap';

export interface CityData {
  name: string;
  weather: {
    city: string;
    days: { date: string; day: string; weather: string; temp: string; icon: string }[];
  };
  vegetablePrice: {
    vegetable: string;
    options: string[];
    forecast: { date: string; temp: string; percent: string }[];
  };
  flowAnalysis: {
    categories: { name: string; color: string }[];
    targets: { name: string; color: string; category: string }[];
    links: { source: string; target: string; value: number }[];
  };
  priceTrend: {
    years: string[];
    avgPrice: number[];
    maxPrice: number[];
  };
  volumeMonitor: {
    total: string;
    sub: string;
    indicators: string[];
    values: number[];
  };
  priceFluctuation: {
    name: string;
    vegetable: string;
    times: string[];
    prices: number[];
    current: string;
  };
  aiDecision: {
    steps: { id: number; text: string; time: string; status: string }[];
  };
  warnings: {
    id: number;
    level: string;
    levelColor: string;
    time: string;
    title: string;
    number: string;
  }[];
}

export interface ProvinceData extends CityData {
  name: string;
  cities: Record<string, CityData>;
  priceLevel: number;
  mapCities: { name: string; value: [number, number, number] }[];
  mapLines: [number, number][][];
}

function makeCityData(
  provinceName: string,
  cityName: string,
  vegetable: string,
  weatherTemplate: { weather: string; temp: string; icon: string },
  basePrice: number,
  warnings: CityData['warnings']
): CityData {
  const scale = 0.85 + Math.random() * 0.3;
  const cityAvg = Array.from({ length: 10 }, () => Number((basePrice * (0.9 + Math.random() * 0.25)).toFixed(1)));
  const cityMax = cityAvg.map(p => Number((p * (1.05 + Math.random() * 0.15)).toFixed(1)));
  const current = cityAvg[cityAvg.length - 1].toFixed(1);

  const times = ['08:20', '08:24', '08:27', '08:30', '08:32', '08:45', '08:48', '08:50', '08:57', '09:01', '09:14', '09:17', '09:25', '09:30'];
  const prices = Array.from({ length: 14 }, () => Number((basePrice * (0.92 + Math.random() * 0.18)).toFixed(1)));

  const forecast = Array.from({ length: 7 }, (_, i) => {
    const date = `09-${20 + i}`;
    const p = (basePrice * (0.9 + Math.random() * 0.25)).toFixed(1);
    const percent = `${60 + Math.floor(Math.random() * 38)}%`;
    return { date, temp: `${p}元/斤`, percent };
  });

  const categories = [
    { name: '叶菜类', color: '#00d4ff' },
    { name: '根茎类', color: '#00ffcc' },
    { name: '茄果类', color: '#66ff99' },
    { name: '菌菇类', color: '#ff66b2' },
    { name: '瓜菜类', color: '#9966ff' },
    { name: '葱蒜类', color: '#ffcc00' },
    { name: '豆类', color: '#00ccff' },
    { name: '特色类', color: '#ff9966' },
  ];

  const targets = [
    { name: `${cityName}${vegetable}`, color: '#00d4ff', category: '叶菜类' },
    { name: `${cityName}本地菜心`, color: '#00a8cc', category: '叶菜类' },
    { name: `${cityName}黄瓜`, color: '#0088aa', category: '叶菜类' },
    { name: `${cityName}白萝卜`, color: '#00ffcc', category: '根茎类' },
    { name: `${cityName}西红柿`, color: '#cc00ff', category: '茄果类' },
    { name: `${cityName}香菇`, color: '#ff66b2', category: '菌菇类' },
    { name: `${cityName}冬瓜`, color: '#66ff99', category: '瓜菜类' },
    { name: `${cityName}大葱`, color: '#ff4444', category: '葱蒜类' },
    { name: `${cityName}四季豆`, color: '#9966ff', category: '豆类' },
    { name: `${cityName}生姜`, color: '#ffcc00', category: '葱蒜类' },
    { name: `${cityName}特产`, color: '#00ccff', category: '特色类' },
    { name: `${cityName}精品蔬菜`, color: '#00ff88', category: '特色类' },
  ];

  const links = targets.map(t => ({ source: t.category, target: t.name, value: Math.floor(60 + Math.random() * 160) }));

  return {
    name: cityName,
    weather: {
      city: cityName,
      days: [
        { date: '今日', day: '1/22', weather: weatherTemplate.weather, temp: weatherTemplate.temp, icon: weatherTemplate.icon },
        { date: '明日', day: '1/23', weather: '多云', temp: adjustTemp(weatherTemplate.temp, -1), icon: '☁️' },
        { date: '', day: '1/24', weather: '晴', temp: adjustTemp(weatherTemplate.temp, 1), icon: '☀️' },
        { date: '', day: '1/25', weather: '阴', temp: adjustTemp(weatherTemplate.temp, 0), icon: '⛅' },
        { date: '', day: '1/26', weather: '小雨', temp: adjustTemp(weatherTemplate.temp, -2), icon: '🌧️' },
        { date: '', day: '1/27', weather: '晴', temp: adjustTemp(weatherTemplate.temp, 2), icon: '☀️' },
      ]
    },
    vegetablePrice: {
      vegetable,
      options: [vegetable, '黄瓜', '西红柿'],
      forecast
    },
    flowAnalysis: { categories, targets, links },
    priceTrend: {
      years: ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
      avgPrice: cityAvg,
      maxPrice: cityMax
    },
    volumeMonitor: {
      total: Math.floor(30000 * scale).toLocaleString(),
      sub: Math.floor(6000 * scale).toLocaleString(),
      indicators: ['产地批发', '网购运输', '销量监测', '物流运输', '产数监测'],
      values: Array.from({ length: 5 }, () => Math.floor(55 + Math.random() * 40))
    },
    priceFluctuation: {
      name: `${vegetable} 价格波动监测分析`,
      vegetable,
      times,
      prices,
      current
    },
    aiDecision: {
      steps: [
        { id: 1, text: `定位区域信息: ${provinceName} ${cityName}`, time: '1.18s', status: 'done' },
        { id: 2, text: '获取气象数据', time: '3.32s', status: 'done' },
        { id: 3, text: '加载历史价格', time: '1.04s', status: 'done' },
        { id: 4, text: '加载预测模型', time: '4.16s', status: 'done' },
        { id: 5, text: '生成推荐建议', time: '2.02s', status: 'done' },
      ]
    },
    warnings
  };
}

function adjustTemp(temp: string, delta: number): string {
  const parts = temp.replace('°', '').split('/');
  if (parts.length !== 2) return temp;
  const min = parseInt(parts[0]) + delta;
  const max = parseInt(parts[1]) + delta;
  return `${min}°/${max}°`;
}

const vegetablePool = ['番茄', '黄瓜', '白菜', '萝卜', '茄子', '辣椒', '土豆', '菠菜', '芹菜', '豆角', '南瓜', '冬瓜', '韭菜', '大葱', '大蒜', '生姜', '生菜', '西兰花', '花菜', '莲藕', '山药', '蘑菇', '木耳'];

const provinceCapitals: Record<string, { city: string; coord: [number, number] }> = {
  '北京市': { city: '北京市', coord: [116.40, 39.90] },
  '天津市': { city: '天津市', coord: [117.20, 39.10] },
  '河北省': { city: '石家庄市', coord: [114.50, 38.00] },
  '山西省': { city: '太原市', coord: [112.50, 37.90] },
  '内蒙古自治区': { city: '呼和浩特市', coord: [111.70, 40.80] },
  '辽宁省': { city: '沈阳市', coord: [123.40, 41.80] },
  '吉林省': { city: '长春市', coord: [125.30, 43.90] },
  '黑龙江省': { city: '哈尔滨市', coord: [126.60, 45.80] },
  '上海市': { city: '上海市', coord: [121.50, 31.20] },
  '江苏省': { city: '南京市', coord: [118.80, 32.10] },
  '浙江省': { city: '杭州市', coord: [120.20, 30.30] },
  '安徽省': { city: '合肥市', coord: [117.30, 31.90] },
  '福建省': { city: '福州市', coord: [119.30, 26.10] },
  '江西省': { city: '南昌市', coord: [115.90, 28.70] },
  '湖北省': { city: '武汉市', coord: [114.30, 30.60] },
  '湖南省': { city: '长沙市', coord: [113.00, 28.20] },
  '广西壮族自治区': { city: '南宁市', coord: [108.40, 22.80] },
  '海南省': { city: '海口市', coord: [110.30, 20.00] },
  '重庆市': { city: '重庆市', coord: [106.50, 29.60] },
  '四川省': { city: '成都市', coord: [104.10, 30.70] },
  '贵州省': { city: '贵阳市', coord: [106.70, 26.60] },
  '云南省': { city: '昆明市', coord: [102.80, 25.00] },
  '西藏自治区': { city: '拉萨市', coord: [91.10, 29.70] },
  '陕西省': { city: '西安市', coord: [108.90, 34.30] },
  '甘肃省': { city: '兰州市', coord: [103.80, 36.10] },
  '青海省': { city: '西宁市', coord: [101.80, 36.60] },
  '宁夏回族自治区': { city: '银川市', coord: [106.20, 38.50] },
  '新疆维吾尔自治区': { city: '乌鲁木齐市', coord: [87.60, 43.80] },
  '台湾省': { city: '台北市', coord: [121.50, 25.00] },
  '香港特别行政区': { city: '香港特别行政区', coord: [114.20, 22.30] },
  '澳门特别行政区': { city: '澳门特别行政区', coord: [113.50, 22.20] },
};

function makeGenericProvinceData(name: string, capital?: { city: string; coord: [number, number] }): ProvinceData {
  const vegetable = vegetablePool[(name.charCodeAt(0) + name.length) % vegetablePool.length];
  const basePrice = Number((3.5 + (name.charCodeAt(0) % 50) / 20).toFixed(1));
  const t = -2 + (name.charCodeAt(0) % 18);
  const weatherTemplate = { weather: '多云', temp: `${t}°/${t + 6}°`, icon: '☁️' };
  const warnings = [
    { id: 1, level: '异常数据', levelColor: 'orange', time: '12:00:00', title: `${name}市场数据波动，请关注价格变化。`, number: '9001' },
    { id: 2, level: '天气提醒', levelColor: 'cyan', time: '08:00:00', title: `${name}近期天气变化，建议合理安排采收。`, number: '9002' },
    { id: 3, level: '供应预警', levelColor: 'red', time: '14:00:00', title: `${name}${vegetable}供应略有波动，注意库存管理。`, number: '9003' },
  ];
  const provinceBase = makeCityData(name, name, vegetable, weatherTemplate, basePrice, warnings);
  const cities: Record<string, CityData> = {};
  const mapCities: { name: string; value: [number, number, number] }[] = [];
  if (capital) {
    const cityData = makeCityData(name, capital.city, vegetable, weatherTemplate, basePrice, warnings);
    cities[capital.city] = cityData;
    mapCities.push({ name: capital.city, value: [...capital.coord, basePrice] });
  }
  return {
    ...provinceBase,
    name,
    cities,
    priceLevel: basePrice,
    mapCities,
    mapLines: [],
  };
}

 function makeProvinceWithCities(
  name: string,
  vegetable: string,
  weather: { weather: string; temp: string; icon: string },
  basePrice: number,
  citiesConfig: { city: string; coord: [number, number] }[],
  categories: { name: string; color: string }[],
  targets: { name: string; color: string; category: string }[],
  priceTrend: { years: string[]; avgPrice: number[]; maxPrice: number[] },
  volumeMonitor: { total: string; sub: string; indicators: string[]; values: number[] },
  priceFluctuation: { times: string[]; prices: number[]; current: string },
  warnings: CityData['warnings']
): ProvinceData {
  const provinceBase = makeCityData(name, name, vegetable, weather, basePrice, warnings);
  const cities: Record<string, CityData> = {};
  const mapCities: { name: string; value: [number, number, number] }[] = [];

  citiesConfig.forEach(({ city, coord }) => {
    const cityPrice = Number((basePrice * (0.9 + Math.random() * 0.25)).toFixed(1));
    const cityData = makeCityData(name, city, vegetable, weather, cityPrice, warnings);
    cities[city] = cityData;
    mapCities.push({ name: city, value: [...coord, cityPrice] });
  });

  const links = targets.map(t => ({ source: t.category, target: t.name, value: Math.floor(60 + Math.random() * 160) }));

  return {
    ...provinceBase,
    name,
    weather: {
      city: citiesConfig[0]?.city || name,
      days: [
        { date: '今日', day: '1/22', weather: weather.weather, temp: weather.temp, icon: weather.icon },
        { date: '明日', day: '1/23', weather: '多云', temp: adjustTemp(weather.temp, -1), icon: '☁️' },
        { date: '', day: '1/24', weather: '晴', temp: adjustTemp(weather.temp, 1), icon: '☀️' },
        { date: '', day: '1/25', weather: '阴', temp: adjustTemp(weather.temp, 0), icon: '⛅' },
        { date: '', day: '1/26', weather: '小雨', temp: adjustTemp(weather.temp, -2), icon: '🌧️' },
        { date: '', day: '1/27', weather: '晴', temp: adjustTemp(weather.temp, 2), icon: '☀️' },
      ]
    },
    vegetablePrice: {
      vegetable,
      options: [vegetable, '黄瓜', '西红柿'],
      forecast: Array.from({ length: 7 }, (_, i) => {
        const date = `09-${20 + i}`;
        const p = (basePrice * (0.9 + Math.random() * 0.25)).toFixed(1);
        const percent = `${60 + Math.floor(Math.random() * 38)}%`;
        return { date, temp: `${p}元/斤`, percent };
      })
    },
    flowAnalysis: { categories, targets, links },
    priceTrend,
    volumeMonitor,
    priceFluctuation: {
      name: `${vegetable} 价格波动监测分析`,
      vegetable,
      times: priceFluctuation.times,
      prices: priceFluctuation.prices,
      current: priceFluctuation.current
    },
    cities,
    priceLevel: basePrice,
    mapCities,
    mapLines: [],
  };
}

export const mockData: Record<string, ProvinceData> = {
  '河南省': {
    name: '河南省',
    weather: {
      city: '郑州市',
      days: [
        { date: '今日', day: '1/22', weather: '多云', temp: '-8°/-2°', icon: '☁️' },
        { date: '明日', day: '1/23', weather: '晴', temp: '-8°/-1°', icon: '🌤️' },
        { date: '', day: '1/24', weather: '晴', temp: '-7°/-2°', icon: '☀️' },
        { date: '', day: '1/25', weather: '阴', temp: '-5°/0°', icon: '⛅' },
        { date: '', day: '1/26', weather: '小雪', temp: '-6°/-1°', icon: '🌨️' },
        { date: '', day: '1/27', weather: '晴', temp: '-4°/2°', icon: '☀️' },
      ]
    },
    vegetablePrice: {
      vegetable: '番茄',
      options: ['番茄', '黄瓜', '辣椒'],
      forecast: [
        { date: '09-24', temp: '7.5元/斤', percent: '93%' },
        { date: '09-22', temp: '7.8元/斤', percent: '82%' },
        { date: '09-21', temp: '7.2元/斤', percent: '76%' },
        { date: '09-23', temp: '7.9元/斤', percent: '81%' },
        { date: '09-26', temp: '8.3元/斤', percent: '77%' },
        { date: '09-20', temp: '7.2元/斤', percent: '70%' },
        { date: '09-27', temp: '7.2元/斤', percent: '99%' },
      ]
    },
    flowAnalysis: {
      categories: [
        { name: '蔬菜类', color: '#00d4ff' },
        { name: '茄果类', color: '#00ffcc' },
        { name: '瓜菜类', color: '#66ff99' },
        { name: '食用菌', color: '#ff66b2' },
        { name: '菜豆类', color: '#9966ff' },
        { name: '根茎类', color: '#ffcc00' },
        { name: '葱蒜类', color: '#00ccff' },
        { name: '叶菜类', color: '#ff9966' },
      ],
      targets: [
        { name: '鲜食大蒜', color: '#00d4ff', category: '蔬菜类' },
        { name: '中牟大蒜', color: '#00a8cc', category: '蔬菜类' },
        { name: '汴梁大蒜', color: '#0088aa', category: '蔬菜类' },
        { name: '民权玉米碴', color: '#00ffcc', category: '茄果类' },
        { name: '柘城辣椒', color: '#cc00ff', category: '茄果类' },
        { name: '西峡小香菇', color: '#ff66b2', category: '瓜菜类' },
        { name: '内黄黄瓜', color: '#66ff99', category: '瓜菜类' },
        { name: '柘城西红柿', color: '#ff4444', category: '食用菌' },
        { name: '温县铁棍山药', color: '#9966ff', category: '菜豆类' },
        { name: '万邦红薯', color: '#ffcc00', category: '根茎类' },
        { name: '宁陵酥梨卜', color: '#00ccff', category: '根茎类' },
        { name: '商丘辣椒', color: '#00ff88', category: '葱蒜类' },
        { name: '西红柿', color: '#ff4444', category: '叶菜类' },
        { name: '淇县西兰花', color: '#00ffaa', category: '叶菜类' },
      ],
      links: [
        { source: '蔬菜类', target: '鲜食大蒜', value: 200 },
        { source: '蔬菜类', target: '中牟大蒜', value: 180 },
        { source: '蔬菜类', target: '汴梁大蒜', value: 150 },
        { source: '茄果类', target: '民权玉米碴', value: 120 },
        { source: '茄果类', target: '柘城辣椒', value: 160 },
        { source: '瓜菜类', target: '西峡小香菇', value: 100 },
        { source: '瓜菜类', target: '内黄黄瓜', value: 140 },
        { source: '食用菌', target: '柘城西红柿', value: 80 },
        { source: '菜豆类', target: '温县铁棍山药', value: 90 },
        { source: '根茎类', target: '万邦红薯', value: 170 },
        { source: '根茎类', target: '宁陵酥梨卜', value: 110 },
        { source: '葱蒜类', target: '商丘辣椒', value: 130 },
        { source: '叶菜类', target: '西红柿', value: 125 },
        { source: '叶菜类', target: '淇县西兰花', value: 95 }
      ]
    },
    priceTrend: {
      years: ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
      avgPrice: [8.2, 6.8, 7.5, 7.0, 6.7, 8.1, 6.2, 7.8, 7.2, 6.5],
      maxPrice: [8.5, 7.6, 7.8, 8.0, 7.9, 8.8, 6.8, 8.5, 7.5, 7.2]
    },
    volumeMonitor: {
      total: '36,000',
      sub: '7,800',
      indicators: ['产地批发', '网购运输', '销量监测', '物流运输', '产数监测'],
      values: [75, 65, 80, 90, 70]
    },
    priceFluctuation: {
      name: '番茄 价格波动监测分析',
      vegetable: '番茄',
      times: ['01:20', '01:24', '01:27', '01:30', '01:32', '01:45', '01:48', '01:50', '01:57', '02:01', '02:14', '02:17', '02:25', '02:30'],
      prices: [7.2, 7.4, 7.6, 7.8, 7.5, 7.3, 7.2, 7.4, 7.6, 7.5, 7.3, 7.4, 7.5, 7.4],
      current: '7.5'
    },
    aiDecision: {
      steps: [
        { id: 1, text: '定位区域信息: 河南省', time: '1.18s', status: 'done' },
        { id: 2, text: '获取气象数据', time: '3.32s', status: 'done' },
        { id: 3, text: '加载历史价格', time: '1.04s', status: 'done' },
        { id: 4, text: '加载预测模型', time: '4.16s', status: 'done' },
        { id: 5, text: '生成推荐建议', time: '2.02s', status: 'done' },
      ]
    },
    warnings: [
      {
        id: 1,
        level: '高温预警',
        levelColor: 'red',
        time: '14:20:00',
        title: '河南北部局部地区地表温度高，在天气预报中会给种植户提供建议，均为有货区，小心库存亏空。',
        number: '1034'
      },
      {
        id: 2,
        level: '暴雨蓝色',
        levelColor: 'cyan',
        time: '14:15:30',
        title: '河南局部地区有强降雨，批发市场到货延迟，到货率将预计降至15%，请予适量多进。',
        number: '1033'
      },
      {
        id: 3,
        level: '异常数据',
        levelColor: 'orange',
        time: '12:23:00',
        title: '河南境内大雾影响，运输车辆预计等待3小时，请通知相关人员调整到货配送时间。',
        number: '1032'
      }
    ],
    cities: {
      '郑州市': makeCityData('河南省', '郑州市', '番茄', { weather: '多云', temp: '-8°/-2°', icon: '☁️' }, 7.5, [
        { id: 1, level: '高温预警', levelColor: 'red', time: '14:20:00', title: '郑州北部局部地区地表温度高，建议种植户注意防晒和库存管理。', number: '1034' },
        { id: 2, level: '暴雨蓝色', levelColor: 'cyan', time: '14:15:30', title: '郑州局部有强降雨，批发市场到货延迟，请适量多进。', number: '1033' },
        { id: 3, level: '异常数据', levelColor: 'orange', time: '12:23:00', title: '郑州境内大雾影响，运输车辆预计等待3小时。', number: '1032' }
      ]),
      '洛阳市': makeCityData('河南省', '洛阳市', '黄瓜', { weather: '晴', temp: '-6°/0°', icon: '☀️' }, 6.2, [
        { id: 1, level: '大风预警', levelColor: 'orange', time: '09:10:00', title: '洛阳山区风力较大，设施农业注意加固大棚。', number: '1035' },
        { id: 2, level: '霜冻预警', levelColor: 'cyan', time: '05:30:00', title: '洛阳夜间气温偏低，部分作物可能出现霜冻。', number: '1036' },
        { id: 3, level: '异常数据', levelColor: 'red', time: '11:20:00', title: '洛阳蔬菜到货量异常，建议关注市场价格波动。', number: '1037' }
      ]),
      '南阳市': makeCityData('河南省', '南阳市', '辣椒', { weather: '阴', temp: '-4°/1°', icon: '⛅' }, 8.1, [
        { id: 1, level: '大雾预警', levelColor: 'orange', time: '07:15:00', title: '南阳早晨能见度低，运输需注意安全。', number: '1038' },
        { id: 2, level: '高温预警', levelColor: 'red', time: '13:40:00', title: '南阳午后气温升高，辣椒存储注意通风。', number: '1039' },
        { id: 3, level: '暴雨蓝色', levelColor: 'cyan', time: '16:00:00', title: '南阳南部有短时强降雨，采收需抓紧。', number: '1040' }
      ]),
      '新乡市': makeCityData('河南省', '新乡市', '茄子', { weather: '多云', temp: '-7°/-1°', icon: '☁️' }, 5.8, [
        { id: 1, level: '寒潮预警', levelColor: 'cyan', time: '08:00:00', title: '新乡气温骤降，温室作物注意保温。', number: '1041' },
        { id: 2, level: '大风预警', levelColor: 'orange', time: '10:30:00', title: '新乡今日风力较强，露天作物注意防护。', number: '1042' },
        { id: 3, level: '异常数据', levelColor: 'red', time: '14:50:00', title: '新乡茄子供应量下降，价格可能上涨。', number: '1043' }
      ]),
      '商丘市': makeCityData('河南省', '商丘市', '大白菜', { weather: '小雪', temp: '-6°/-2°', icon: '🌨️' }, 4.3, [
        { id: 1, level: '道路结冰', levelColor: 'cyan', time: '06:20:00', title: '商丘部分道路结冰，蔬菜运输时间延长。', number: '1044' },
        { id: 2, level: '低温预警', levelColor: 'orange', time: '09:45:00', title: '商丘持续低温，大白菜注意防冻。', number: '1045' },
        { id: 3, level: '异常数据', levelColor: 'red', time: '13:10:00', title: '商丘大白菜销量激增，建议提前备货。', number: '1046' }
      ])
    },
    priceLevel: 6.4,
    mapCities: [
      { name: '郑州市', value: [113.65, 34.76, 7.5] },
      { name: '洛阳市', value: [112.45, 34.62, 6.2] },
      { name: '南阳市', value: [112.53, 33.00, 8.1] },
      { name: '新乡市', value: [113.88, 35.30, 5.8] },
      { name: '商丘市', value: [115.65, 34.45, 4.3] },
    ],
    mapLines: []
  },
  '广东省': {
    name: '广东省',
    weather: {
      city: '广州市',
      days: [
        { date: '今日', day: '3/15', weather: '雷阵雨', temp: '22°/28°', icon: '⛈️' },
        { date: '明日', day: '3/16', weather: '多云', temp: '21°/27°', icon: '☁️' },
        { date: '', day: '3/17', weather: '晴', temp: '20°/26°', icon: '☀️' },
        { date: '', day: '3/18', weather: '晴', temp: '19°/25°', icon: '☀️' },
        { date: '', day: '3/19', weather: '小雨', temp: '20°/24°', icon: '🌧️' },
        { date: '', day: '3/20', weather: '多云', temp: '21°/26°', icon: '⛅' },
      ]
    },
    vegetablePrice: {
      vegetable: '菜心',
      options: ['菜心', '生菜', '芥蓝'],
      forecast: [
        { date: '09-24', temp: '5.2元/斤', percent: '88%' },
        { date: '09-22', temp: '5.0元/斤', percent: '79%' },
        { date: '09-21', temp: '4.8元/斤', percent: '72%' },
        { date: '09-23', temp: '5.3元/斤', percent: '85%' },
        { date: '09-26', temp: '5.6元/斤', percent: '91%' },
        { date: '09-20', temp: '4.9元/斤', percent: '68%' },
        { date: '09-27', temp: '5.1元/斤', percent: '95%' },
      ]
    },
    flowAnalysis: {
      categories: [
        { name: '叶菜类', color: '#00d4ff' },
        { name: '根茎类', color: '#00ffcc' },
        { name: '瓜果类', color: '#66ff99' },
        { name: '菌菇类', color: '#ff66b2' },
        { name: '豆类', color: '#9966ff' },
        { name: '香料类', color: '#ffcc00' },
        { name: '水生类', color: '#00ccff' },
        { name: '野菜类', color: '#ff9966' },
      ],
      targets: [
        { name: '增城菜心', color: '#00d4ff', category: '叶菜类' },
        { name: '白云生菜', color: '#00a8cc', category: '叶菜类' },
        { name: '番禺油麦菜', color: '#0088aa', category: '叶菜类' },
        { name: '南沙莲藕', color: '#00ffcc', category: '根茎类' },
        { name: '韶关萝卜', color: '#cc00ff', category: '根茎类' },
        { name: '茂名冬瓜', color: '#ff66b2', category: '瓜果类' },
        { name: '湛江南瓜', color: '#66ff99', category: '瓜果类' },
        { name: '清远香菇', color: '#ff4444', category: '菌菇类' },
        { name: '惠州四季豆', color: '#9966ff', category: '豆类' },
        { name: '梅州蒜苗', color: '#ffcc00', category: '香料类' },
        { name: '珠海茭白', color: '#00ccff', category: '水生类' },
        { name: '肇庆紫苏', color: '#00ff88', category: '香料类' },
        { name: '云浮番薯叶', color: '#ff4444', category: '野菜类' },
        { name: '江门枸杞叶', color: '#00ffaa', category: '野菜类' },
      ],
      links: [
        { source: '叶菜类', target: '增城菜心', value: 220 },
        { source: '叶菜类', target: '白云生菜', value: 170 },
        { source: '叶菜类', target: '番禺油麦菜', value: 140 },
        { source: '根茎类', target: '南沙莲藕', value: 130 },
        { source: '根茎类', target: '韶关萝卜', value: 160 },
        { source: '瓜果类', target: '茂名冬瓜', value: 110 },
        { source: '瓜果类', target: '湛江南瓜', value: 150 },
        { source: '菌菇类', target: '清远香菇', value: 85 },
        { source: '豆类', target: '惠州四季豆', value: 95 },
        { source: '香料类', target: '梅州蒜苗', value: 180 },
        { source: '香料类', target: '肇庆紫苏', value: 115 },
        { source: '水生类', target: '珠海茭白', value: 70 },
        { source: '野菜类', target: '云浮番薯叶', value: 125 },
        { source: '野菜类', target: '江门枸杞叶', value: 100 }
      ]
    },
    priceTrend: {
      years: ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
      avgPrice: [5.2, 4.8, 5.5, 5.1, 4.9, 5.3, 4.7, 5.6, 5.0, 4.8],
      maxPrice: [5.5, 5.2, 5.8, 5.4, 5.3, 5.7, 5.0, 6.0, 5.3, 5.1]
    },
    volumeMonitor: {
      total: '52,000',
      sub: '12,400',
      indicators: ['产地直发', '电商运输', '批发监测', '冷链物流', '零售数据'],
      values: [82, 78, 70, 88, 65]
    },
    priceFluctuation: {
      name: '菜心 价格波动监测分析',
      vegetable: '菜心',
      times: ['08:20', '08:24', '08:27', '08:30', '08:32', '08:45', '08:48', '08:50', '08:57', '09:01', '09:14', '09:17', '09:25', '09:30'],
      prices: [5.0, 5.1, 5.3, 5.2, 5.0, 4.9, 5.0, 5.2, 5.3, 5.1, 5.0, 5.1, 5.2, 5.1],
      current: '5.1'
    },
    aiDecision: {
      steps: [
        { id: 1, text: '定位区域信息: 广东省', time: '0.98s', status: 'done' },
        { id: 2, text: '获取气象数据', time: '2.85s', status: 'done' },
        { id: 3, text: '加载历史价格', time: '1.22s', status: 'done' },
        { id: 4, text: '加载预测模型', time: '3.76s', status: 'done' },
        { id: 5, text: '生成推荐建议', time: '1.85s', status: 'done' },
      ]
    },
    warnings: [
      {
        id: 1,
        level: '台风预警',
        levelColor: 'red',
        time: '09:15:00',
        title: '广东沿海地区受台风外围影响，强风暴雨可能导致采收延迟，建议提前备货。',
        number: '2045'
      },
      {
        id: 2,
        level: '高温预警',
        levelColor: 'orange',
        time: '11:30:20',
        title: '粤北地区连续高温，叶菜类损耗率可能上升，建议加强冷链运输调度。',
        number: '2044'
      },
      {
        id: 3,
        level: '暴雨蓝色',
        levelColor: 'cyan',
        time: '13:45:00',
        title: '珠三角局部有短时强降雨，批发市场到货时间可能延后1-2小时。',
        number: '2043'
      }
    ],
    cities: {
      '广州市': makeCityData('广东省', '广州市', '菜心', { weather: '雷阵雨', temp: '22°/28°', icon: '⛈️' }, 5.2, [
        { id: 1, level: '台风预警', levelColor: 'red', time: '09:15:00', title: '广州受台风外围影响，强风暴雨可能导致采收延迟。', number: '2045' },
        { id: 2, level: '高温预警', levelColor: 'orange', time: '11:30:20', title: '广州连续高温，叶菜类损耗率可能上升。', number: '2044' },
        { id: 3, level: '暴雨蓝色', levelColor: 'cyan', time: '13:45:00', title: '广州局部有短时强降雨，批发市场到货可能延后。', number: '2043' }
      ]),
      '深圳市': makeCityData('广东省', '深圳市', '生菜', { weather: '多云', temp: '23°/29°', icon: '☁️' }, 6.5, [
        { id: 1, level: '暴雨预警', levelColor: 'cyan', time: '10:20:00', title: '深圳午后有雷阵雨，注意蔬菜防潮。', number: '2046' },
        { id: 2, level: '高温预警', levelColor: 'orange', time: '12:40:00', title: '深圳气温较高，生菜冷链运输需加强。', number: '2047' },
        { id: 3, level: '异常数据', levelColor: 'red', time: '15:00:00', title: '深圳生菜需求激增，价格可能上行。', number: '2048' }
      ]),
      '佛山市': makeCityData('广东省', '佛山市', '芥蓝', { weather: '晴', temp: '21°/27°', icon: '☀️' }, 4.8, [
        { id: 1, level: '大风预警', levelColor: 'orange', time: '08:30:00', title: '佛山风力较大，设施农业注意加固。', number: '2049' },
        { id: 2, level: '暴雨蓝色', levelColor: 'cyan', time: '14:10:00', title: '佛山局部强降雨，采收需抓紧。', number: '2050' },
        { id: 3, level: '异常数据', levelColor: 'red', time: '16:30:00', title: '佛山芥蓝供应稳定，价格小幅波动。', number: '2051' }
      ]),
      '东莞市': makeCityData('广东省', '东莞市', '油麦菜', { weather: '小雨', temp: '20°/25°', icon: '🌧️' }, 5.5, [
        { id: 1, level: '暴雨预警', levelColor: 'cyan', time: '09:00:00', title: '东莞持续小雨，油麦菜采收受影响。', number: '2052' },
        { id: 2, level: '道路湿滑', levelColor: 'orange', time: '11:20:00', title: '东莞道路湿滑，运输车辆注意安全。', number: '2053' },
        { id: 3, level: '异常数据', levelColor: 'red', time: '13:50:00', title: '东莞油麦菜到货量减少，关注价格变化。', number: '2054' }
      ]),
      '珠海市': makeCityData('广东省', '珠海市', '空心菜', { weather: '多云', temp: '24°/30°', icon: '⛅' }, 4.2, [
        { id: 1, level: '台风预警', levelColor: 'red', time: '08:15:00', title: '珠海受台风外围影响，海上运输可能中断。', number: '2055' },
        { id: 2, level: '高温预警', levelColor: 'orange', time: '10:45:00', title: '珠海气温偏高，空心菜注意保鲜。', number: '2056' },
        { id: 3, level: '异常数据', levelColor: 'cyan', time: '14:20:00', title: '珠海空心菜供应充足，价格稳定。', number: '2057' }
      ])
    },
    priceLevel: 5.2,
    mapCities: [
      { name: '广州市', value: [113.23, 23.16, 5.2] },
      { name: '深圳市', value: [114.07, 22.62, 6.5] },
      { name: '佛山市', value: [113.12, 23.02, 4.8] },
      { name: '东莞市', value: [113.75, 23.05, 5.5] },
      { name: '珠海市', value: [113.52, 22.30, 4.2] },
    ],
    mapLines: []
  },
  '山东省': {
    name: '山东省',
    weather: {
      city: '济南市',
      days: [
        { date: '今日', day: '4/08', weather: '晴', temp: '12°/22°', icon: '☀️' },
        { date: '明日', day: '4/09', weather: '多云', temp: '11°/21°', icon: '☁️' },
        { date: '', day: '4/10', weather: '阴', temp: '10°/19°', icon: '⛅' },
        { date: '', day: '4/11', weather: '小雨', temp: '9°/16°', icon: '🌧️' },
        { date: '', day: '4/12', weather: '晴', temp: '10°/20°', icon: '☀️' },
        { date: '', day: '4/13', weather: '晴', temp: '12°/23°', icon: '☀️' },
      ]
    },
    vegetablePrice: {
      vegetable: '大葱',
      options: ['大葱', '白菜', '萝卜'],
      forecast: [
        { date: '09-24', temp: '3.8元/斤', percent: '81%' },
        { date: '09-22', temp: '3.6元/斤', percent: '75%' },
        { date: '09-21', temp: '3.5元/斤', percent: '68%' },
        { date: '09-23', temp: '3.9元/斤', percent: '84%' },
        { date: '09-26', temp: '4.1元/斤', percent: '89%' },
        { date: '09-20', temp: '3.4元/斤', percent: '62%' },
        { date: '09-27', temp: '3.7元/斤', percent: '92%' },
      ]
    },
    flowAnalysis: {
      categories: [
        { name: '葱蒜类', color: '#00d4ff' },
        { name: '根茎类', color: '#00ffcc' },
        { name: '叶菜类', color: '#66ff99' },
        { name: '茄果类', color: '#ff66b2' },
        { name: '瓜果类', color: '#9966ff' },
        { name: '菌菇类', color: '#ffcc00' },
        { name: '豆类', color: '#00ccff' },
        { name: '特色类', color: '#ff9966' },
      ],
      targets: [
        { name: '章丘大葱', color: '#00d4ff', category: '葱蒜类' },
        { name: '金乡大蒜', color: '#00a8cc', category: '葱蒜类' },
        { name: '苍山大蒜', color: '#0088aa', category: '葱蒜类' },
        { name: '寿光胡萝卜', color: '#00ffcc', category: '根茎类' },
        { name: '莱芜生姜', color: '#cc00ff', category: '根茎类' },
        { name: '胶州大白菜', color: '#ff66b2', category: '叶菜类' },
        { name: '滕州马铃薯', color: '#66ff99', category: '根茎类' },
        { name: '莘县西红柿', color: '#ff4444', category: '茄果类' },
        { name: '寿光黄瓜', color: '#9966ff', category: '瓜果类' },
        { name: '邹平香菇', color: '#ffcc00', category: '菌菇类' },
        { name: '菏泽芸豆', color: '#00ccff', category: '豆类' },
        { name: '平度大姜', color: '#00ff88', category: '根茎类' },
        { name: '肥城桃', color: '#ff4444', category: '特色类' },
        { name: '烟台苹果', color: '#00ffaa', category: '特色类' },
      ],
      links: [
        { source: '葱蒜类', target: '章丘大葱', value: 240 },
        { source: '葱蒜类', target: '金乡大蒜', value: 210 },
        { source: '葱蒜类', target: '苍山大蒜', value: 180 },
        { source: '根茎类', target: '寿光胡萝卜', value: 150 },
        { source: '根茎类', target: '莱芜生姜', value: 170 },
        { source: '叶菜类', target: '胶州大白菜', value: 200 },
        { source: '根茎类', target: '滕州马铃薯', value: 190 },
        { source: '茄果类', target: '莘县西红柿', value: 130 },
        { source: '瓜果类', target: '寿光黄瓜', value: 160 },
        { source: '菌菇类', target: '邹平香菇', value: 90 },
        { source: '豆类', target: '菏泽芸豆', value: 110 },
        { source: '根茎类', target: '平度大姜', value: 140 },
        { source: '特色类', target: '肥城桃', value: 75 },
        { source: '特色类', target: '烟台苹果', value: 85 }
      ]
    },
    priceTrend: {
      years: ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
      avgPrice: [4.2, 3.8, 4.5, 4.1, 3.9, 4.3, 3.7, 4.6, 4.0, 3.8],
      maxPrice: [4.5, 4.1, 4.8, 4.4, 4.2, 4.6, 4.0, 5.0, 4.3, 4.1]
    },
    volumeMonitor: {
      total: '68,000',
      sub: '15,200',
      indicators: ['产地集散', '批发运输', '仓储监测', '冷链配送', '市场零售'],
      values: [88, 72, 85, 92, 78]
    },
    priceFluctuation: {
      name: '大葱 价格波动监测分析',
      vegetable: '大葱',
      times: ['10:20', '10:24', '10:27', '10:30', '10:32', '10:45', '10:48', '10:50', '10:57', '11:01', '11:14', '11:17', '11:25', '11:30'],
      prices: [3.6, 3.7, 3.8, 3.9, 3.7, 3.6, 3.5, 3.7, 3.8, 3.7, 3.6, 3.7, 3.8, 3.7],
      current: '3.7'
    },
    aiDecision: {
      steps: [
        { id: 1, text: '定位区域信息: 山东省', time: '1.05s', status: 'done' },
        { id: 2, text: '获取气象数据', time: '3.12s', status: 'done' },
        { id: 3, text: '加载历史价格', time: '1.18s', status: 'done' },
        { id: 4, text: '加载预测模型', time: '4.28s', status: 'done' },
        { id: 5, text: '生成推荐建议', time: '2.15s', status: 'done' },
      ]
    },
    warnings: [
      {
        id: 1,
        level: '霜冻预警',
        levelColor: 'cyan',
        time: '06:30:00',
        title: '鲁中山区夜间可能出现霜冻，建议提前做好大棚蔬菜保温措施。',
        number: '3056'
      },
      {
        id: 2,
        level: '大风黄色',
        levelColor: 'orange',
        time: '08:45:20',
        title: '山东半岛有大风天气，跨海运输蔬菜可能受到影响，注意航行安全。',
        number: '3055'
      },
      {
        id: 3,
        level: '干旱预警',
        levelColor: 'red',
        time: '14:10:00',
        title: '鲁西北部分地区降水偏少，大葱等作物灌溉需求增加，注意水源调配。',
        number: '3054'
      }
    ],
    cities: {
      '济南市': makeCityData('山东省', '济南市', '大葱', { weather: '晴', temp: '12°/22°', icon: '☀️' }, 3.8, [
        { id: 1, level: '霜冻预警', levelColor: 'cyan', time: '06:30:00', title: '济南山区夜间可能出现霜冻，建议做好大棚保温。', number: '3056' },
        { id: 2, level: '大风黄色', levelColor: 'orange', time: '08:45:20', title: '济南有大风天气，蔬菜运输注意安全。', number: '3055' },
        { id: 3, level: '干旱预警', levelColor: 'red', time: '14:10:00', title: '济南部分地区降水偏少，大葱灌溉需求增加。', number: '3054' }
      ]),
      '青岛市': makeCityData('山东省', '青岛市', '白菜', { weather: '多云', temp: '13°/20°', icon: '☁️' }, 2.9, [
        { id: 1, level: '大风预警', levelColor: 'orange', time: '07:20:00', title: '青岛海上风大，跨海蔬菜运输可能受影响。', number: '3057' },
        { id: 2, level: '低温预警', levelColor: 'cyan', time: '09:40:00', title: '青岛夜间气温较低，白菜注意防冻。', number: '3058' },
        { id: 3, level: '异常数据', levelColor: 'red', time: '13:15:00', title: '青岛白菜销量上升，价格可能小幅上涨。', number: '3059' }
      ]),
      '烟台市': makeCityData('山东省', '烟台市', '苹果', { weather: '阴', temp: '11°/19°', icon: '⛅' }, 5.5, [
        { id: 1, level: '霜冻预警', levelColor: 'cyan', time: '05:50:00', title: '烟台果园夜间有霜冻风险，注意防护。', number: '3060' },
        { id: 2, level: '大风预警', levelColor: 'orange', time: '10:10:00', title: '烟台沿海风力较大，运输注意安全。', number: '3061' },
        { id: 3, level: '异常数据', levelColor: 'red', time: '15:30:00', title: '烟台苹果供应稳定，价格保持平稳。', number: '3062' }
      ]),
      '潍坊市': makeCityData('山东省', '潍坊市', '胡萝卜', { weather: '小雨', temp: '10°/18°', icon: '🌧️' }, 3.2, [
        { id: 1, level: '暴雨蓝色', levelColor: 'cyan', time: '08:00:00', title: '潍坊局部小雨，胡萝卜采收受影响。', number: '3063' },
        { id: 2, level: '道路湿滑', levelColor: 'orange', time: '11:30:00', title: '潍坊道路湿滑，运输车辆注意安全。', number: '3064' },
        { id: 3, level: '异常数据', levelColor: 'red', time: '14:45:00', title: '潍坊胡萝卜库存充足，价格稳定。', number: '3065' }
      ]),
      '临沂市': makeCityData('山东省', '临沂市', '生姜', { weather: '晴', temp: '11°/21°', icon: '☀️' }, 6.8, [
        { id: 1, level: '高温预警', levelColor: 'orange', time: '12:00:00', title: '临沂午后气温升高，生姜存储注意通风。', number: '3066' },
        { id: 2, level: '干旱预警', levelColor: 'red', time: '08:30:00', title: '临沂降水偏少，生姜灌溉需求增加。', number: '3067' },
        { id: 3, level: '异常数据', levelColor: 'cyan', time: '16:10:00', title: '临沂生姜价格波动，建议关注市场动态。', number: '3068' }
      ])
    },
    priceLevel: 4.4,
    mapCities: [
      { name: '济南市', value: [117.00, 36.65, 3.8] },
      { name: '青岛市', value: [120.38, 36.07, 2.9] },
      { name: '烟台市', value: [121.45, 37.46, 5.5] },
      { name: '潍坊市', value: [119.16, 36.71, 3.2] },
      { name: '临沂市', value: [118.35, 35.05, 6.8] },
    ],
    mapLines: []
  },
  '湖北省': makeProvinceWithCities(
    '湖北省',
    '莲藕',
    { weather: '小雨', temp: '18°/25°', icon: '🌧️' },
    4.5,
    [
      { city: '武汉市', coord: [114.31, 30.52] },
      { city: '宜昌市', coord: [111.29, 30.70] },
      { city: '襄阳市', coord: [112.20, 32.04] },
      { city: '荆州市', coord: [112.24, 30.33] },
      { city: '黄冈市', coord: [114.87, 30.45] },
    ],
    [
      { name: '水生类', color: '#00d4ff' },
      { name: '叶菜类', color: '#00ffcc' },
      { name: '茄果类', color: '#66ff99' },
      { name: '根茎类', color: '#ff66b2' },
      { name: '豆类', color: '#9966ff' },
      { name: '菌菇类', color: '#ffcc00' },
      { name: '葱蒜类', color: '#00ccff' },
      { name: '特色类', color: '#ff9966' },
    ],
    [
      { name: '洪湖莲藕', color: '#00d4ff', category: '水生类' },
      { name: '武汉菜薹', color: '#00a8cc', category: '叶菜类' },
      { name: '宜昌西红柿', color: '#0088aa', category: '茄果类' },
      { name: '襄阳白萝卜', color: '#00ffcc', category: '根茎类' },
      { name: '荆州四季豆', color: '#cc00ff', category: '豆类' },
      { name: '随州香菇', color: '#ff66b2', category: '菌菇类' },
      { name: '恩施大蒜', color: '#66ff99', category: '葱蒜类' },
      { name: '潜江小龙虾', color: '#ffcc00', category: '特色类' },
      { name: '孝感韭菜', color: '#00ccff', category: '葱蒜类' },
      { name: '荆门黄瓜', color: '#00ff88', category: '茄果类' },
      { name: '黄石菠菜', color: '#ff4444', category: '叶菜类' },
      { name: '十堰木耳', color: '#00ffaa', category: '菌菇类' },
    ],
    {
      years: ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
      avgPrice: [4.5, 4.2, 4.8, 4.6, 4.3, 4.9, 4.1, 5.0, 4.7, 4.4],
      maxPrice: [4.9, 4.6, 5.2, 5.0, 4.7, 5.3, 4.5, 5.4, 5.1, 4.8]
    },
    {
      total: '45,000',
      sub: '9,200',
      indicators: ['产地批发', '网购运输', '销量监测', '物流运输', '产数监测'],
      values: [78, 68, 82, 88, 74]
    },
    {
      times: ['07:20', '07:24', '07:27', '07:30', '07:32', '07:45', '07:48', '07:50', '07:57', '08:01', '08:14', '08:17', '08:25', '08:30'],
      prices: [4.3, 4.4, 4.5, 4.6, 4.5, 4.4, 4.3, 4.5, 4.6, 4.5, 4.4, 4.5, 4.6, 4.5],
      current: '4.5'
    },
    [
      { id: 1, level: '暴雨蓝色', levelColor: 'cyan', time: '09:10:00', title: '湖北江汉平原有明显降雨，莲藕采收需关注田间排水。', number: '4001' },
      { id: 2, level: '高温预警', levelColor: 'orange', time: '12:30:00', title: '鄂东地区午后高温，叶菜类注意遮阴保鲜。', number: '4002' },
      { id: 3, level: '异常数据', levelColor: 'red', time: '15:00:00', title: '武汉批发市场到货量波动，莲藕价格短期上行。', number: '4003' },
    ]
  ),
  '湖南省': makeProvinceWithCities(
    '湖南省',
    '辣椒',
    { weather: '多云', temp: '22°/30°', icon: '☁️' },
    5.2,
    [
      { city: '长沙市', coord: [112.98, 28.21] },
      { city: '岳阳市', coord: [113.13, 29.37] },
      { city: '常德市', coord: [111.70, 29.05] },
      { city: '衡阳市', coord: [112.57, 26.90] },
      { city: '株洲市', coord: [113.15, 27.83] },
    ],
    [
      { name: '辣椒类', color: '#00d4ff' },
      { name: '叶菜类', color: '#00ffcc' },
      { name: '瓜果类', color: '#66ff99' },
      { name: '根茎类', color: '#ff66b2' },
      { name: '豆类', color: '#9966ff' },
      { name: '菌菇类', color: '#ffcc00' },
      { name: '葱蒜类', color: '#00ccff' },
      { name: '特色类', color: '#ff9966' },
    ],
    [
      { name: '长沙辣椒', color: '#00d4ff', category: '辣椒类' },
      { name: '岳阳生菜', color: '#00a8cc', category: '叶菜类' },
      { name: '常德冬瓜', color: '#0088aa', category: '瓜果类' },
      { name: '衡阳白萝卜', color: '#00ffcc', category: '根茎类' },
      { name: '株洲豆角', color: '#cc00ff', category: '豆类' },
      { name: '湘潭香菇', color: '#ff66b2', category: '菌菇类' },
      { name: '永州大葱', color: '#66ff99', category: '葱蒜类' },
      { name: '湘西腊肉', color: '#ffcc00', category: '特色类' },
      { name: '益阳黄瓜', color: '#00ccff', category: '瓜果类' },
      { name: '邵阳西红柿', color: '#00ff88', category: '辣椒类' },
      { name: '郴州芹菜', color: '#ff4444', category: '叶菜类' },
      { name: '怀化生姜', color: '#00ffaa', category: '葱蒜类' },
    ],
    {
      years: ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
      avgPrice: [5.0, 4.7, 5.3, 5.1, 4.8, 5.4, 4.6, 5.5, 5.2, 4.9],
      maxPrice: [5.4, 5.1, 5.7, 5.5, 5.2, 5.8, 5.0, 5.9, 5.6, 5.3]
    },
    {
      total: '51,000',
      sub: '11,500',
      indicators: ['产地直发', '电商运输', '批发监测', '冷链物流', '零售数据'],
      values: [80, 76, 74, 86, 69]
    },
    {
      times: ['08:10', '08:14', '08:17', '08:20', '08:22', '08:35', '08:38', '08:40', '08:47', '08:51', '09:04', '09:07', '09:15', '09:20'],
      prices: [5.0, 5.1, 5.3, 5.2, 5.0, 4.9, 5.0, 5.2, 5.3, 5.1, 5.0, 5.1, 5.2, 5.1],
      current: '5.1'
    },
    [
      { id: 1, level: '高温预警', levelColor: 'orange', time: '11:20:00', title: '湘中地区持续高温，辣椒 storage 需注意通风降温。', number: '5001' },
      { id: 2, level: '暴雨蓝色', levelColor: 'cyan', time: '14:00:00', title: '湖南南部有短时强降雨，采收和运输需抓紧。', number: '5002' },
      { id: 3, level: '异常数据', levelColor: 'red', time: '16:30:00', title: '长沙辣椒需求量上升，批发商建议提前备货。', number: '5003' },
    ]
  ),
  '四川省': makeProvinceWithCities(
    '四川省',
    '青菜',
    { weather: '阴', temp: '18°/24°', icon: '⛅' },
    3.8,
    [
      { city: '成都市', coord: [104.07, 30.67] },
      { city: '绵阳市', coord: [104.68, 31.47] },
      { city: '南充市', coord: [106.11, 30.84] },
      { city: '乐山市', coord: [103.77, 29.58] },
      { city: '宜宾市', coord: [104.56, 29.77] },
    ],
    [
      { name: '叶菜类', color: '#00d4ff' },
      { name: '茄果类', color: '#00ffcc' },
      { name: '根茎类', color: '#66ff99' },
      { name: '豆类', color: '#ff66b2' },
      { name: '菌菇类', color: '#9966ff' },
      { name: '葱蒜类', color: '#ffcc00' },
      { name: '瓜菜类', color: '#00ccff' },
      { name: '特色类', color: '#ff9966' },
    ],
    [
      { name: '成都青菜', color: '#00d4ff', category: '叶菜类' },
      { name: '绵阳黄瓜', color: '#00a8cc', category: '瓜菜类' },
      { name: '南充西红柿', color: '#0088aa', category: '茄果类' },
      { name: '乐山茄子', color: '#00ffcc', category: '茄果类' },
      { name: '宜宾豆角', color: '#cc00ff', category: '豆类' },
      { name: '德阳香菇', color: '#ff66b2', category: '菌菇类' },
      { name: '内江大葱', color: '#66ff99', category: '葱蒜类' },
      { name: '眉山泡菜', color: '#ffcc00', category: '特色类' },
      { name: '泸州白萝卜', color: '#00ccff', category: '根茎类' },
      { name: '自贡生菜', color: '#00ff88', category: '叶菜类' },
      { name: '攀枝花苦瓜', color: '#ff4444', category: '瓜菜类' },
      { name: '广元木耳', color: '#00ffaa', category: '菌菇类' },
    ],
    {
      years: ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
      avgPrice: [3.8, 3.5, 4.0, 3.9, 3.6, 4.1, 3.4, 4.2, 3.9, 3.7],
      maxPrice: [4.2, 3.9, 4.4, 4.3, 4.0, 4.5, 3.8, 4.6, 4.3, 4.1]
    },
    {
      total: '48,000',
      sub: '10,200',
      indicators: ['产地集散', '批发运输', '仓储监测', '冷链配送', '市场零售'],
      values: [82, 70, 78, 85, 72]
    },
    {
      times: ['09:10', '09:14', '09:17', '09:20', '09:22', '09:35', '09:38', '09:40', '09:47', '09:51', '10:04', '10:07', '10:15', '10:20'],
      prices: [3.6, 3.7, 3.8, 3.9, 3.8, 3.7, 3.6, 3.8, 3.9, 3.8, 3.7, 3.8, 3.9, 3.8],
      current: '3.8'
    },
    [
      { id: 1, level: '暴雨蓝色', levelColor: 'cyan', time: '08:30:00', title: '四川盆地西部有降雨，青菜采收注意避雨。', number: '6001' },
      { id: 2, level: '高温预警', levelColor: 'orange', time: '13:00:00', title: '成都平原午后气温偏高，注意蔬菜保鲜。', number: '6002' },
      { id: 3, level: '异常数据', levelColor: 'red', time: '17:00:00', title: '川南地区青菜到货量偏少，价格小幅上涨。', number: '6003' },
    ]
  ),
  '浙江省': makeProvinceWithCities(
    '浙江省',
    '茭白',
    { weather: '晴', temp: '20°/28°', icon: '☀️' },
    5.0,
    [
      { city: '杭州市', coord: [120.16, 30.25] },
      { city: '宁波市', coord: [121.55, 29.83] },
      { city: '温州市', coord: [120.65, 28.00] },
      { city: '嘉兴市', coord: [120.76, 30.75] },
      { city: '绍兴市', coord: [120.58, 30.00] },
    ],
    [
      { name: '水生类', color: '#00d4ff' },
      { name: '叶菜类', color: '#00ffcc' },
      { name: '茄果类', color: '#66ff99' },
      { name: '菌菇类', color: '#ff66b2' },
      { name: '根茎类', color: '#9966ff' },
      { name: '豆类', color: '#ffcc00' },
      { name: '葱蒜类', color: '#00ccff' },
      { name: '特色类', color: '#ff9966' },
    ],
    [
      { name: '杭州茭白', color: '#00d4ff', category: '水生类' },
      { name: '宁波青菜', color: '#00a8cc', category: '叶菜类' },
      { name: '温州西红柿', color: '#0088aa', category: '茄果类' },
      { name: '嘉兴香菇', color: '#00ffcc', category: '菌菇类' },
      { name: '绍兴萝卜', color: '#cc00ff', category: '根茎类' },
      { name: '湖州黄瓜', color: '#ff66b2', category: '茄果类' },
      { name: '金华大蒜', color: '#66ff99', category: '葱蒜类' },
      { name: '舟山海鲜', color: '#ffcc00', category: '特色类' },
      { name: '台州西兰花', color: '#00ccff', category: '叶菜类' },
      { name: '衢州豆角', color: '#00ff88', category: '豆类' },
      { name: '丽水竹笋', color: '#ff4444', category: '特色类' },
      { name: '义乌生姜', color: '#00ffaa', category: '葱蒜类' },
    ],
    {
      years: ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
      avgPrice: [4.8, 4.5, 5.1, 4.9, 4.6, 5.2, 4.4, 5.3, 5.0, 4.7],
      maxPrice: [5.2, 4.9, 5.5, 5.3, 5.0, 5.6, 4.8, 5.7, 5.4, 5.1]
    },
    {
      total: '44,000',
      sub: '9,800',
      indicators: ['产地批发', '网购运输', '销量监测', '物流运输', '产数监测'],
      values: [76, 72, 80, 84, 71]
    },
    {
      times: ['06:20', '06:24', '06:27', '06:30', '06:32', '06:45', '06:48', '06:50', '06:57', '07:01', '07:14', '07:17', '07:25', '07:30'],
      prices: [4.8, 4.9, 5.0, 5.1, 5.0, 4.9, 4.8, 5.0, 5.1, 5.0, 4.9, 5.0, 5.1, 5.0],
      current: '5.0'
    },
    [
      { id: 1, level: '台风预警', levelColor: 'red', time: '07:40:00', title: '浙江沿海受台风外围影响，海上运输可能中断。', number: '7001' },
      { id: 2, level: '高温预警', levelColor: 'orange', time: '12:10:00', title: '浙北地区连续高温，叶菜类损耗率可能上升。', number: '7002' },
      { id: 3, level: '暴雨蓝色', levelColor: 'cyan', time: '15:30:00', title: '浙东局部有短时强降雨，批发市场到货可能延后。', number: '7003' },
    ]
  ),
  '江苏省': makeProvinceWithCities(
    '江苏省',
    '水芹',
    { weather: '多云', temp: '19°/27°', icon: '☁️' },
    4.0,
    [
      { city: '南京市', coord: [118.80, 32.06] },
      { city: '苏州市', coord: [120.62, 31.30] },
      { city: '无锡市', coord: [120.30, 31.57] },
      { city: '徐州市', coord: [117.18, 34.27] },
      { city: '扬州市', coord: [119.42, 32.40] },
    ],
    [
      { name: '水生类', color: '#00d4ff' },
      { name: '叶菜类', color: '#00ffcc' },
      { name: '茄果类', color: '#66ff99' },
      { name: '菌菇类', color: '#ff66b2' },
      { name: '根茎类', color: '#9966ff' },
      { name: '豆类', color: '#ffcc00' },
      { name: '葱蒜类', color: '#00ccff' },
      { name: '特色类', color: '#ff9966' },
    ],
    [
      { name: '南京水芹', color: '#00d4ff', category: '水生类' },
      { name: '苏州青菜', color: '#00a8cc', category: '叶菜类' },
      { name: '无锡西红柿', color: '#0088aa', category: '茄果类' },
      { name: '徐州萝卜', color: '#00ffcc', category: '根茎类' },
      { name: '扬州黄瓜', color: '#cc00ff', category: '茄果类' },
      { name: '南通豆角', color: '#ff66b2', category: '豆类' },
      { name: '常州香菇', color: '#66ff99', category: '菌菇类' },
      { name: '淮安大葱', color: '#ffcc00', category: '葱蒜类' },
      { name: '盐城西兰花', color: '#00ccff', category: '叶菜类' },
      { name: '泰州生姜', color: '#00ff88', category: '葱蒜类' },
      { name: '宿迁大蒜', color: '#ff4444', category: '葱蒜类' },
      { name: '镇江生菜', color: '#00ffaa', category: '叶菜类' },
    ],
    {
      years: ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
      avgPrice: [3.9, 3.6, 4.2, 4.0, 3.7, 4.3, 3.5, 4.4, 4.1, 3.8],
      maxPrice: [4.3, 4.0, 4.6, 4.4, 4.1, 4.7, 3.9, 4.8, 4.5, 4.2]
    },
    {
      total: '53,000',
      sub: '12,000',
      indicators: ['产地集散', '批发运输', '仓储监测', '冷链配送', '市场零售'],
      values: [84, 74, 80, 88, 76]
    },
    {
      times: ['07:50', '07:54', '07:57', '08:00', '08:02', '08:15', '08:18', '08:20', '08:27', '08:31', '08:44', '08:47', '08:55', '09:00'],
      prices: [3.8, 3.9, 4.0, 4.1, 4.0, 3.9, 3.8, 4.0, 4.1, 4.0, 3.9, 4.0, 4.1, 4.0],
      current: '4.0'
    },
    [
      { id: 1, level: '大风预警', levelColor: 'orange', time: '08:00:00', title: '江苏沿海有大风，海上蔬菜运输需注意安全。', number: '8001' },
      { id: 2, level: '暴雨蓝色', levelColor: 'cyan', time: '13:20:00', title: '苏南局部有雷阵雨，水芹采收注意避雨。', number: '8002' },
      { id: 3, level: '异常数据', levelColor: 'red', time: '16:00:00', title: '南京水芹到货量波动，建议关注价格走势。', number: '8003' },
    ]
  )
};

Object.keys(provinceAdcodeMap).forEach((provinceName) => {
  if (!mockData[provinceName]) {
    mockData[provinceName] = makeGenericProvinceData(provinceName, provinceCapitals[provinceName]);
  }
});

export const provinceList = Object.keys(mockData);
export const defaultProvince = '河南省';
