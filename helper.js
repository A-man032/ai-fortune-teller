export function calculateZodiac(month, day) {
  const zodiacDates = {
    '白羊座': [[3, 21], [4, 19]],
    '金牛座': [[4, 20], [5, 20]],
    '双子座': [[5, 21], [6, 21]],
    '巨蟹座': [[6, 22], [7, 22]],
    '狮子座': [[7, 23], [8, 22]],
    '处女座': [[8, 23], [9, 22]],
    '天秤座': [[9, 23], [10, 23]],
    '天蝎座': [[10, 24], [11, 22]],
    '射手座': [[11, 23], [12, 21]],
    '摩羯座': [[12, 22], [1, 19]],
    '水瓶座': [[1, 20], [2, 18]],
    '双鱼座': [[2, 19], [3, 20]]
  };

  for (const [zodiac, [[startMonth, startDay], [endMonth, endDay]]] of Object.entries(zodiacDates)) {
    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay) ||
      // 特殊处理摩羯座跨年的情况
      (zodiac === '摩羯座' && ((month === 12 && day >= 22) || (month === 1 && day <= 19)))
    ) {
      return zodiac;
    }
  }

  return '白羊座'; // 默认返回
}