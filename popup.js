import { marked } from './node_modules/marked/lib/marked.esm.js';
import { fortuneData } from './fortuneData.js';
import { detailedFortunePrompt, fortunePrompt, pastLifePrompt, loveDestinyPrompt, confessionPrompt } from './prompt.js';
import { callAzureAPI, calculateZodiac } from './helper.js';
import { TarotReading } from './Tarot/tarot.js';
import { ICON } from './icon.js'

document.addEventListener('DOMContentLoaded', function() {
  const calculateBtn = document.getElementById('calculateBtn');
  const birthDateInput = document.getElementById('birthDate');
  const zodiacSelect = document.getElementById('zodiac');
  const resultSection = document.getElementById('resultSection');
  const fortuneResult = document.getElementById('fortuneResult');
  const pastLifeDate = document.getElementById('pastLifeDate');
  const birthplace = document.getElementById('birthplace');
  const calculateLove = document.getElementById('calculateLove');
  const loveDate = document.getElementById('loveDate');
  const loveStory = document.getElementById('loveStory');
  const loveResult = document.getElementById('loveResult');

  const tarotReading = new TarotReading();

  document.querySelector('#prevTab .icon-container').innerHTML = ICON.LEFT_ARROW;
  document.querySelector('#nextTab .icon-container').innerHTML = ICON.RIGHT_ARROW;

  chrome.storage.local.get(['birthDate', 'zodiac', 'gender', 'birthplace', 'love-gender'], function(result) {
    if (result.birthDate) {
      birthDateInput.value = result.birthDate;
      pastLifeDate.value = result.birthDate;
      loveDate.value = result.birthDate;
    }
    if (result.zodiac) zodiacSelect.value = result.zodiac;
    if (result.gender) {
      const genderRadio = document.querySelector(`input[name="gender"][value="${result.gender}"]`);
      if (genderRadio) genderRadio.checked = true;
    }
    if (result.birthplace) birthplace.value = result.birthplace;
    if (result['love-gender']) {
      const loveGenderRadio = document.querySelector(`input[name="love-gender"][value="${result['love-gender']}"]`);
      if (loveGenderRadio) loveGenderRadio.checked = true;
    }
  });

  calculateBtn.addEventListener('click', async function() {
    const birthDate = birthDateInput.value;
    const zodiac = zodiacSelect.value;

    if (!birthDate) {
      alert('请输入出生日期！');
      return;
    }

    chrome.storage.local.set({
      birthDate: birthDate,
      zodiac: zodiac
    });

    try {
      resultSection.style.display = 'block';
      fortuneResult.textContent = '正在生成运势分析...';

      const fortune = await calculateFortune(birthDate, zodiac);
      fortuneResult.innerHTML = marked(fortune);
    } catch (error) {
      console.error('处理失败：', error);
      resultSection.style.display = 'block';
      fortuneResult.textContent = `获取运势失败：${error.message}\n请稍后重试。`;
    }
  });

  async function calculateFortune(birthDate, zodiac) {
    const messages = [...fortunePrompt, {
      "role": "user",
      "content": `请根据以下信息为我分析运势：
        生辰：${birthDate}
        星座：${zodiac}
        当前时间：${new Date().toLocaleString()}`
    }
    ];

    try {
      const response = await callAzureAPI(messages, (result) => {
        const fortuneResult = document.getElementById('fortuneResult');
        if (fortuneResult) {
          fortuneResult.innerHTML = marked(result);
          // 添加滚动逻辑
          requestAnimationFrame(() => {
            setTimeout(() => {
              fortuneResult.scrollTo({
                top: fortuneResult.scrollHeight,
                behavior: 'smooth'
              });
            }, 50);
          });
        }
      });
      return response;
    } catch (error) {
      console.error('获取运势失败：', error);
      throw new Error(`运势计算失败：${error.message}`);
    }
  }

  birthDateInput.addEventListener('change', function() {
    try {
      const date = new Date(this.value);
      if (isNaN(date.getTime())) {
        console.error('无效的日期');
        return;
      }
      
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      const zodiac = calculateZodiac(month, day);
      zodiacSelect.value = zodiac;
    } catch (error) {
      console.error('计算星座时出错:', error);
    }
  });

  // 添加标签切换功能
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const prevTab = document.getElementById('prevTab');
  const nextTab = document.getElementById('nextTab');

  let currentPage = 0;
  const tabsPerPage = 3;
  const totalPages = Math.ceil(tabButtons.length / tabsPerPage);

  function updateTabVisibility() {
    tabButtons.forEach((button, index) => {
      const pageStart = currentPage * tabsPerPage;
      const pageEnd = pageStart + tabsPerPage;
      button.style.display = (index >= pageStart && index < pageEnd) ? 'block' : 'none';
    });
  }

  prevTab.addEventListener('click', () => {
    currentPage = currentPage === 0 ? totalPages - 1 : currentPage - 1;
    updateTabVisibility();
  });

  nextTab.addEventListener('click', () => {
    currentPage = currentPage === totalPages - 1 ? 0 : currentPage + 1;
    updateTabVisibility();
  });

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      
      // 更新按钮状态
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // 更新内容显示
      tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // 初始化标签页显示
  updateTabVisibility();

  // 每日一签功能
  const drawBtn = document.getElementById('drawBtn');
  const fortuneStickImg = document.querySelector('.fortune-stick-img');
  
  drawBtn.addEventListener('click', async () => {
    const canDraw = await checkLastDrawTime();
    
    if (!canDraw) {
      alert('今日已抽过签了，请明天再来~');
      // Show previous result if available
      chrome.storage.local.get(['lastDrawResult'], function(result) {
        if (result.lastDrawResult) {
          drawBtn.style.display = 'none';
          displayDrawResult(result.lastDrawResult);
        }
      });
      return;
    }
  
    drawBtn.disabled = true;
    drawBtn.textContent = '正在抽签...';
    
    fortuneStickImg.classList.add('shaking');
    
    setTimeout(async () => {
      try {
        fortuneStickImg.classList.remove('shaking');
        const result = await drawDailyFortune();
        
        // Save draw time and result
        chrome.storage.local.set({
          lastDrawTime: new Date().toISOString(),
          lastDrawResult: result
        });
        
        drawBtn.style.display = 'none';
        displayDrawResult(result);
      } catch (error) {
        console.error('抽签失败：', error);
        alert('抽签失败，请稍后重试');
      } finally {
        drawBtn.disabled = false;
        drawBtn.textContent = '抽签';
      }
    }, 3000);
  });

  // 前世今生功能
  const calculatePastLife = document.getElementById('calculatePastLife');
  const pastLifeResult = document.getElementById('pastLifeResult');
  const pastLifeStory = document.getElementById('pastLifeStory');

  calculatePastLife.addEventListener('click', async () => {
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    
    if (!pastLifeDate.value || !gender || !birthplace.value) {
      alert('请填写完整的信息！');
      return;
    }

    chrome.storage.local.set({
      birthDate: pastLifeDate.value,
      gender: gender,
      birthplace: birthplace.value,
      zodiac: calculateZodiac(new Date(pastLifeDate.value).getMonth() + 1, new Date(pastLifeDate.value).getDate())
    });

    try {
      calculatePastLife.disabled = true;
      calculatePastLife.textContent = '正在推算...';
      pastLifeResult.style.display = 'block';
      pastLifeStory.innerHTML = '<p class="loading">正在揭示前世因果...</p>';

      const messages = [...pastLifePrompt, {
        "role": "user",
        "content": `请根据以下信息，讲述一个关于我前世今生的故事：
          生辰：${pastLifeDate.value}
          性别：${gender}
          出生地：${birthplace.value}
          当前时间：${new Date().toLocaleString()}`
      }];

      await callAzureAPI(messages, (result) => {
        if (pastLifeStory) {
          pastLifeStory.innerHTML = marked(result);
          pastLifeStory.style.opacity = '0';
          requestAnimationFrame(() => {
            pastLifeStory.style.transition = 'opacity 1s ease-in';
            pastLifeStory.style.opacity = '1';
          });
        }
      });

    } catch (error) {
      console.error('推算前世失败：', error);
      alert('推算失败，请稍后重试');
    } finally {
      calculatePastLife.disabled = false;
      calculatePastLife.textContent = '揭示前世今生';
    }
  });

  // 姻缘天机功能
  calculateLove.addEventListener('click', async () => {
    const gender = document.querySelector('input[name="love-gender"]:checked')?.value;
    
    if (!loveDate.value || !gender) {
      alert('请填写完整的信息！');
      return;
    }

    try {
      calculateLove.disabled = true;
      calculateLove.textContent = '正在推算...';
      loveResult.style.display = 'block';
      loveStory.innerHTML = '<p class="loading">正在解读姻缘天机...</p>';

      chrome.storage.local.set({
        birthDate: loveDate.value,
        'love-gender': gender
      });

      const messages = [...loveDestinyPrompt, {
        "role": "user",
        "content": `请根据以下信息，解读我的姻缘：
          生辰：${loveDate.value}
          性别：${gender}
          当前时间：${new Date().toLocaleString()}`
      }];

      await callAzureAPI(messages, (result) => {
        if (loveStory) {
          loveStory.innerHTML = marked(result);
          loveStory.style.opacity = '0';
          requestAnimationFrame(() => {
            loveStory.style.transition = 'opacity 1s ease-in';
            loveStory.style.opacity = '1';
          });
        }
      });

    } catch (error) {
      console.error('解读姻缘失败：', error);
      alert('解读失败，请稍后重试');
    } finally {
      calculateLove.disabled = false;
      calculateLove.textContent = '揭示姻缘天机';
    }
  });

  // Add to popup.js
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      button.style.setProperty('--mouse-x', `${x}px`);
      button.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Add smooth scroll for long content
  document.querySelectorAll('.story-content').forEach(container => {
    container.addEventListener('scroll', () => {
      requestAnimationFrame(() => {
        const scrolled = container.scrollTop / (container.scrollHeight - container.clientHeight);
        container.style.setProperty('--scroll', scrolled.toString());
      });
    });
  });

  const userMessage = document.getElementById('userMessage');
  const sendMessage = document.getElementById('sendMessage');
  const chatMessages = document.getElementById('chatMessages');

  sendMessage.addEventListener('click', async () => {
    const message = userMessage.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage('user', message);
    userMessage.value = '';

    try {
      sendMessage.disabled = true;
      
      const messages = [...confessionPrompt, {
        "role": "user",
        "content": message
      }];

      let aiResponse = '';
      await callAzureAPI(messages, (result) => {
        aiResponse = result; // Accumulate the response
        addMessage('ai', aiResponse); // Update the same message
      });

    } catch (error) {
      console.error('发送消息失败：', error);
      addMessage('system', '抱歉，我现在有点恍惚，请稍后再试...');
    } finally {
      sendMessage.disabled = false;
    }
  });

  function addMessage(type, content) {
    console.log(`[${type}] ${content}`);
    
    // For AI responses, update existing message or create new one
    if (type === 'ai') {
      let aiMessage = chatMessages.querySelector('.message.ai:last-child');
      if (!aiMessage) {
        aiMessage = document.createElement('div');
        aiMessage.className = `message ${type}`;
        chatMessages.appendChild(aiMessage);
      }
      aiMessage.innerHTML = marked(content);
    } else {
      // For user and system messages, create new message
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${type}`;
      messageDiv.textContent = content;
      chatMessages.appendChild(messageDiv);
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Add enter key support
  userMessage.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage.click();
    }
  });

  // Call initialization when page loads
  initializeDrawButton();
});

async function drawDailyFortune() {
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
  
  const todayFortune = {
    career: getRandomItem(fortuneData.career),
    study: getRandomItem(fortuneData.study),
    love: getRandomItem(fortuneData.love),
    wealth: getRandomItem(fortuneData.wealth),
    goodThings: getRandomItem(fortuneData.goodThings),
    badThings: getRandomItem(fortuneData.badThings),
    emoji: getRandomItem(fortuneData.emojis)
  };

  const result = `
# ${todayFortune.emoji} 今日运势

## 事业运
${todayFortune.career}

## 学业运
${todayFortune.study}

## 情感运
${todayFortune.love}

## 财运
${todayFortune.wealth}

## 今日宜
${todayFortune.goodThings}

## 今日忌
${todayFortune.badThings}
`;

  return result;
}

function displayDrawResult(result) {
  const drawResult = document.getElementById('drawResult');
  drawResult.style.display = 'block';
  
  const formattedResult = result
    .replace(/## 事业运\n/g, '<h2 class="fortune-career">事业运</h2>')
    .replace(/## 学业运\n/g, '<h2 class="fortune-study">学业运</h2>')
    .replace(/## 情感运\n/g, '<h2 class="fortune-love">情感运</h2>')
    .replace(/## 财运\n/g, '<h2 class="fortune-wealth">财运</h2>')
    .replace(/## 今日宜\n/g, '<h2 class="fortune-good">今日宜</h2>')
    .replace(/## 今日忌\n/g, '<h2 class="fortune-bad">今日忌</h2>');
  
  drawResult.innerHTML = `
    <div class="result-card">
      ${marked(formattedResult)}
      <button id="getDetailBtn" class="detail-button">获取详细运势分析</button>
    </div>
  `;
  
  const getDetailBtn = document.getElementById('getDetailBtn');
  if (getDetailBtn) {
    getDetailBtn.addEventListener('click', handleDetailButtonClick);
  }
}

async function handleDetailButtonClick() {
  const getDetailBtn = document.getElementById('getDetailBtn');
  const drawResult = document.getElementById('drawResult');

  try {
    getDetailBtn.disabled = true;
    getDetailBtn.textContent = '正在分析...';
    
    // 创建详细运势section
    const detailSection = document.createElement('div');
    detailSection.className = 'detailed-fortune';
    detailSection.innerHTML = `
      <h2>详细运势分析</h2>
      <div id="detailed-fortune-text"></div>
    `;
    
    // 将详细运势section添加到结果卡片中
    drawResult.querySelector('.result-card').appendChild(detailSection);
    
    const details = document.getElementById('detailed-fortune-text');
    const message = [{
      "role": "user",
      "content": `当前时间是：${new Date().toLocaleString()}`
    }, ...detailedFortunePrompt];

    await callAzureAPI(message, (result) => {
      if (details) {
        getDetailBtn.style.display = 'none';
        detailSection.style.display = 'block';
        details.innerHTML = marked(result);

        // 修正滚动逻辑，使用正确的 ID 选择器
        const detailsElement = document.getElementById('detailed-fortune-text');
        if (detailsElement) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              detailsElement.scrollTo({
                top: detailsElement.scrollHeight,
                behavior: 'smooth'
              });
            }, 50);
          });
        }
      }
    });

  } catch (error) {
    console.error('获取详细运势失败：', error);
    alert('获取详细运势失败，请稍后重试');
  } finally {
    getDetailBtn.disabled = false;
    getDetailBtn.textContent = '获取详细运势分析';
  }
}

function checkLastDrawTime() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['lastDrawTime'], function(result) {
      if (!result.lastDrawTime) {
        resolve(true);
        return;
      }

      const lastDrawDate = new Date(result.lastDrawTime);
      const today = new Date();
      
      // Check if last draw was on a different day
      const canDraw = lastDrawDate.toDateString() !== today.toDateString();
      resolve(canDraw);
    });
  });
}

async function initializeDrawButton() {
  const canDraw = await checkLastDrawTime();
  
  if (!canDraw) {
    chrome.storage.local.get(['lastDrawResult'], function(result) {
      if (result.lastDrawResult) {
        drawBtn.style.display = 'none';
        displayDrawResult(result.lastDrawResult);
      }
    });
  }
}

// Add this to your existing event listeners
document.querySelectorAll('.preset-question').forEach(button => {
  button.addEventListener('click', () => {
    const question = button.getAttribute('data-question');
    document.getElementById('tarotQuestion').value = question;
  });
});
