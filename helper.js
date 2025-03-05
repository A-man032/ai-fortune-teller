import { TAROT_CARDS } from './constant.js';

export async function callAzureAPI(messages, resultCallback) {
  try {
    // http://20.151.59.221:8000/callAzureAPI
    const response = await fetch('http://localhost:8080/callAzureAPI', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Origin': 'chrome-extension://odnepegnnihgclbpnfbegdnnalpgoail'
      },
      body: JSON.stringify({ messages: messages })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 响应错误：', response.status, errorText);
      throw new Error(`API调用失败: ${response.status} - ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let resultText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              // Parse the JSON data properly
              const jsonData = JSON.parse(data);
              if (jsonData.content) {
                resultText += jsonData.content;
                if (resultCallback) {
                  resultCallback(resultText);
                }
              }
            } catch (e) {
              console.error('解析JSON出错:', e, 'Raw data:', data);
            }
          }
        }
      }
    }
    return resultText;
  } catch (error) {
    console.error('API 调用过程出错：', error);
    throw error;
  }
}

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

// 获取完整的塔罗牌数组
export const getAllTarotCards = () => {
  const minorArcanaCards = [
    ...TAROT_CARDS.minorArcana.wands,
    ...TAROT_CARDS.minorArcana.cups,
    ...TAROT_CARDS.minorArcana.swords,
    ...TAROT_CARDS.minorArcana.pentacles
  ];
  
  return [...TAROT_CARDS.majorArcana, ...minorArcanaCards];
};

// 随机抽取指定数量的塔罗牌
export const drawRandomCards = (count = 3) => {
  const allCards = getAllTarotCards();
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export function getBackOfTheCard () {
  return 'images/tarot/CardBack.png';
}