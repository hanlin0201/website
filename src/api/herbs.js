/**
 * 模拟 API：获取药材列表数据
 * 实际项目中替换为真实后端接口
 */

const MOCK_HERBS = [
  { id: 1, name: '人参', namePinyin: 'Renshen', tags: ['补气', '安神'], image: 'renshen.webp', nature: '甘、微苦，温', channel: '归脾、肺、心经', efficacy: '大补元气，复脉固脱，补脾益肺，生津养血，安神益智。', usage: '3～9g，另煎兑服；研末吞服，每次1～2g。', taboo: '实证、热证忌服；不宜与藜芦、五灵脂同用。' },
  { id: 2, name: '黄芪', namePinyin: 'Huangqi', tags: ['补气', '清热'], image: 'huangqi.webp', nature: '甘，微温', channel: '归肺、脾经', efficacy: '补气升阳，固表止汗，利水消肿，生津养血，行滞通痹，托毒排脓，敛疮生肌。', usage: '9～30g。', taboo: '表实邪盛、气滞湿阻、食积内停、阴虚阳亢者慎用。' },
  { id: 3, name: '枸杞子', namePinyin: 'Gouqizi', tags: ['补气', '安神'], image: 'gouqizi.webp', nature: '甘，平', channel: '归肝、肾经', efficacy: '滋补肝肾，益精明目。', usage: '6～12g。', taboo: '外邪实热、脾虚有湿及泄泻者慎服。' },
  { id: 4, name: '当归', namePinyin: 'Danggui', tags: ['补气', '活血'], image: 'danggui.webp', nature: '甘、辛，温', channel: '归肝、心、脾经', efficacy: '补血活血，调经止痛，润肠通便。', usage: '6～12g。', taboo: '湿盛中满及大便溏泻者慎服。' },
  { id: 5, name: '茯苓', namePinyin: 'Fuling', tags: ['清热', '安神'], image: 'fuling.webp', nature: '甘、淡，平', channel: '归心、肺、脾、肾经', efficacy: '利水渗湿，健脾，宁心安神。', usage: '9～15g。', taboo: '阴虚而无湿热、虚寒滑精、气虚下陷者慎服。' },
  { id: 6, name: '党参', namePinyin: 'Dangshen', tags: ['补气'], image: 'dangshen.webp', nature: '甘，平', channel: '归脾、肺经', efficacy: '健脾益肺，养血生津。', usage: '9～30g。', taboo: '实证、热证者不宜单独应用。' },
  { id: 7, name: '白术', namePinyin: 'Baizhu', tags: ['补气', '健脾'], image: 'baizhu.webp', nature: '苦、甘，温', channel: '归脾、胃经', efficacy: '健脾益气，燥湿利水，止汗，安胎。', usage: '6～12g。', taboo: '阴虚燥渴、气滞胀闷者慎服。' },
  { id: 8, name: '甘草', namePinyin: 'Gancao', tags: ['补气', '清热'], image: 'gancao.webp', nature: '甘，平', channel: '归心、肺、脾、胃经', efficacy: '补脾益气，清热解毒，祛痰止咳，缓急止痛，调和诸药。', usage: '2～10g。', taboo: '不宜与海藻、京大戟、甘遂、芫花同用；湿盛胀满、浮肿者不宜。' },
  { id: 9, name: '菊花', namePinyin: 'Juhua', tags: ['清热', '明目'], image: 'juhua.webp', nature: '辛、甘、苦，微寒', channel: '归肺、肝经', efficacy: '散风清热，平肝明目，清热解毒。', usage: '5～10g。', taboo: '气虚胃寒、食少泄泻者慎服。' },
  { id: 10, name: '酸枣仁', namePinyin: 'Suanzaoren', tags: ['安神', '养心'], image: 'suanzaoren.webp', nature: '甘、酸，平', channel: '归肝、胆、心经', efficacy: '养心补肝，宁心安神，敛汗，生津。', usage: '9～15g。', taboo: '有实邪郁火及滑泄者慎服。' },
  { id: 11, name: '金银花', namePinyin: 'Jinyinhua', tags: ['清热', '解毒'], image: 'jinyinhua.webp', nature: '甘，寒', channel: '归肺、心、胃经', efficacy: '清热解毒，疏散风热。', usage: '6～15g。', taboo: '脾胃虚寒及气虚疮疡脓清者慎服。' },
  { id: 12, name: '山药', namePinyin: 'Shanyao', tags: ['补气', '健脾'], image: 'shanyao.webp', nature: '甘，平', channel: '归脾、肺、肾经', efficacy: '补脾养胃，生津益肺，补肾涩精。', usage: '15～30g。', taboo: '湿盛中满或有实邪者慎服。' },
]

const CACHE_KEY = 'herb_list_cache'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 分钟，模拟 Redis TTL

/**
 * 模拟从后端 API 获取药材数据
 * @returns {Promise<Array>}
 */
export async function fetchHerbsFromApi() {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  return [...MOCK_HERBS]
}

/**
 * 根据 id 获取单个药材（模拟 API）
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function fetchHerbByIdFromApi(id) {
  await new Promise(resolve => setTimeout(resolve, 150))
  return MOCK_HERBS.find(h => h.id === Number(id)) ?? null
}

export { CACHE_KEY, CACHE_TTL_MS, MOCK_HERBS }
