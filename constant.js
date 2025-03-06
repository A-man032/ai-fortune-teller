import { 
  tarotPromptThreeCards,
  tarotPromptCelticCross,
  tarotPromptSingleCard,
  tarotPromptSevenCards,
  tarotPromptRelationship } from './prompt.js';

export const TAROT_CARDS = {
  // 大阿尔卡纳牌 (22张)
  majorArcana: [
    { id: 0, name: "愚者", image: "images/tarot/TheFool.png" },
    { id: 1, name: "魔术师", image: "images/tarot/TheMagician.png" },
    { id: 2, name: "女祭司", image: "images/tarot/TheHighPriestess.png" },
    { id: 3, name: "女皇", image: "images/tarot/TheEmpress.png" },
    { id: 4, name: "皇帝", image: "images/tarot/TheEmperor.png" },
    { id: 5, name: "教皇", image: "images/tarot/TheHierophant.png" },
    { id: 6, name: "恋人", image: "images/tarot/TheLovers.png" },
    { id: 7, name: "战车", image: "images/tarot/TheChariot.png" },
    { id: 8, name: "力量", image: "images/tarot/Strength.png" },
    { id: 9, name: "隐士", image: "images/tarot/TheHermit.png" },
    { id: 10, name: "命运之轮", image: "images/tarot/WheelOfFortune.png" },
    { id: 11, name: "正义", image: "images/tarot/Justice.png" },
    { id: 12, name: "倒吊人", image: "images/tarot/TheHangedMan.png" },
    { id: 13, name: "死神", image: "images/tarot/Death.png" },
    { id: 14, name: "节制", image: "images/tarot/Temperance.png" },
    { id: 15, name: "恶魔", image: "images/tarot/TheDevil.png" },
    { id: 16, name: "塔", image: "images/tarot/TheTower.png" },
    { id: 17, name: "星星", image: "images/tarot/TheStar.png" },
    { id: 18, name: "月亮", image: "images/tarot/TheMoon.png" },
    { id: 19, name: "太阳", image: "images/tarot/TheSun.png" },
    { id: 20, name: "审判", image: "images/tarot/Judgement.png" },
    { id: 21, name: "世界", image: "images/tarot/TheWorld.png" }
  ],
  
  // 小阿尔卡纳牌 (56张)
  minorArcana: {
    // 权杖牌组
    wands: [
      ...Array.from({length: 10}, (_, i) => ({
        id: i + 1,
        name: `权杖${i === 0 ? "A" : i + 1}`,
        image: `images/tarot/Wands${i + 1}.png`
      })),
      {
        id: 11,
        name: "权杖侍从",
        image: "images/tarot/PageOfWands.png"
      },
      {
        id: 12,
        name: "权杖骑士",
        image: "images/tarot/KnightOfWands.png"
      },
      {
        id: 13,
        name: "权杖王后",
        image: "images/tarot/QueenOfWands.png"
      },
      {
        id: 14,
        name: "权杖国王",
        image: "images/tarot/KingOfWands.png"
      }
    ],
    
    // 圣杯牌组
    cups: [
      ...Array.from({length: 10}, (_, i) => ({
        id: i + 1,
        name: `圣杯${i === 0 ? "A" : i + 1}`,
        image: `images/tarot/Cups${i + 1}.png`
      })),
      {
        id: 11,
        name: "圣杯侍从",
        image: "images/tarot/PageOfCups.png"
      },
      {
        id: 12,
        name: "圣杯骑士",
        image: "images/tarot/KnightOfCups.png"
      },
      {
        id: 13,
        name: "圣杯王后",
        image: "images/tarot/QueenOfCups.png"
      },
      {
        id: 14,
        name: "圣杯国王",
        image: "images/tarot/KingOfCups.png"
      }
    ],
    
    // 宝剑牌组
    swords: [
      ...Array.from({length: 10}, (_, i) => ({
        id: i + 1,
        name: `宝剑${i === 0 ? "A" : i + 1}`,
        image: `images/tarot/Swords${i + 1}.png`
      })),
      {
        id: 11,
        name: "宝剑侍从",
        image: "images/tarot/PageOfSwords.png"
      },
      {
        id: 12,
        name: "宝剑骑士",
        image: "images/tarot/KnightOfSwords.png"
      },
      {
        id: 13,
        name: "宝剑王后",
        image: "images/tarot/QueenOfSwords.png"
      },
      {
        id: 14,
        name: "宝剑国王",
        image: "images/tarot/KingOfSwords.png"
      }
    ],
    
    // 金币牌组
    pentacles: [
      ...Array.from({length: 10}, (_, i) => ({
        id: i + 1,
        name: `金币${i === 0 ? "A" : i + 1}`,
        image: `images/tarot/Pentacles${i + 1}.png`
      })),
      {
        id: 11,
        name: "金币侍从",
        image: "images/tarot/PageOfPentacles.png"
      },
      {
        id: 12,
        name: "金币骑士",
        image: "images/tarot/KnightOfPentacles.png"
      },
      {
        id: 13,
        name: "金币王后",
        image: "images/tarot/QueenOfPentacles.png"
      },
      {
        id: 14,
        name: "金币国王",
        image: "images/tarot/KingOfPentacles.png"
      }
    ]
  }
};

export const SPREADS = {
  THREE_CARD: {
    id: 'three-card',
    name: '三张牌牌型',
    description: '最简单的牌型之一，通常用于回答具体问题或进行短期预测，适合是非题的占卜。三张牌分别代表过去、现在和未来。',
    positions: ['过去', '现在', '未来'],
    prompt: tarotPromptThreeCards,
    count: 3
  },
  CELTIC_CROSS: {
    id: 'celtic-cross',
    name: '凯尔特十字牌阵',
    description: '最常用的牌型之一，适合进行详细和全面的解读。包括十张牌，分别代表不同方面。',
    positions: ['核心问题', '当前挑战', '过去基础', '近期过去', '最佳结果', '即将发生', '当前态度', '外在影响', '希望与恐惧', '最终结果'],
    prompt: tarotPromptCelticCross,
    count: 10
  },
  SINGLE_CARD: {
    id: 'single-card',
    name: '单张牌牌型',
    description: '用于快速回答一个简单的问题或提供每日指引。',
    positions: ['指引'],
    prompt: tarotPromptSingleCard,
    count: 1
  },
  SEVEN_CARD: {
    id: 'seven-card',
    name: '七张牌牌型',
    description: '用于分析一周的运势或某个特定问题的不同方面。',
    positions: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    prompt: tarotPromptSevenCards,
    count: 7
  },
  RELATIONSHIP: {
    id: 'relationship',
    name: '恋人牌型',
    description: '专门用于解读感情和人际关系问题。',
    positions: ['你的现状', '对方现状', '关系现状', '你的期望', '对方期望', '关系发展'],
    prompt: tarotPromptRelationship,
    count: 6
  }
};