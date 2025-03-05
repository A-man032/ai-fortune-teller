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
