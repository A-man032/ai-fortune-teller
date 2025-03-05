import { marked } from '../node_modules/marked/lib/marked.esm.js';
import { getAllTarotCards, getBackOfTheCard, callAzureAPI } from '../helper.js';
import { ICON } from '../icon.js';
import { tarotPrompt } from '../prompt.js';

export class TarotReading {
  constructor() {
    this.cards = getAllTarotCards();
    this.selectedCards = [];
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.questionInput = document.getElementById('tarotQuestion');
    this.startButton = document.getElementById('startTarotReading');
    this.readingArea = document.getElementById('tarotReadingArea');
    this.interpretation = document.getElementById('tarotInterpretation');
    this.tarotSection = document.getElementById('tarotSection');
  }

  bindEvents() {
    this.startButton.addEventListener('click', () => this.startReading());
  }

  startReading() {
    const question = this.questionInput.value.trim();
    if (!question) {
      alert('请输入你想要解答的问题');
      return;
    }

    this.showShufflingOverlay();
  }

  showShufflingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'tarot-overlay';
    
    const animationContainer = document.createElement('div');
    animationContainer.className = 'shuffling-animation';
    
    // Create floating cards animation
    for (let i = 0; i < 5; i++) {
      const card = document.createElement('div');
      card.className = 'floating-card';
      card.style.backgroundImage = `url(${getBackOfTheCard()})`;
      
      // Random animation parameters
      const translateX = Math.random() * 400 - 100;
      const translateY = Math.random() * 400 - 100;
      const rotation = Math.random() * 360;
      
      card.style.setProperty('--translateX', `${translateX}px`);
      card.style.setProperty('--translateY', `${translateY}px`);
      card.style.setProperty('--rotation', `${rotation}deg`);
      card.style.animationDelay = `${i * 0.4}s`;
      
      animationContainer.appendChild(card);
    }
    
    const text = document.createElement('div');
    text.className = 'shuffle-text';
    text.textContent = '屏息凝神...';
    
    overlay.appendChild(animationContainer);
    overlay.appendChild(text);
    document.body.appendChild(overlay);

    // After animation, show card deck in overlay
    setTimeout(() => {
      overlay.innerHTML = '';
      this.createCardDeckInOverlay(overlay);
    }, 3000);
  }

  createCardDeckInOverlay(overlay) {
    const deckContainer = document.createElement('div');
    deckContainer.className = 'tarot-deck';
    
    this.cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'tarot-card-small';
      const originalRotation = Math.random() * 360;
      cardElement.innerHTML = `<img src="${getBackOfTheCard()}" alt="Card Back">`;
      // Store original rotation as a CSS variable
      cardElement.style.setProperty('--originalRotation', `${originalRotation}deg`);
      cardElement.style.transform = `rotate(${originalRotation}deg)`;
      cardElement.style.left = `${Math.random() * 60}%`;
      cardElement.style.top = `${Math.random() * 60}%`;
      deckContainer.appendChild(cardElement);
    });

    const shuffleButton = document.createElement('button');
    shuffleButton.className = 'tarot-button shuffle-button';
    shuffleButton.textContent = '洗牌';
    shuffleButton.addEventListener('click', () => this.shuffleCardsInOverlay(overlay, deckContainer));

    overlay.appendChild(deckContainer);
    overlay.appendChild(shuffleButton);
  }

  async shuffleCardsInOverlay(overlay, deckContainer) {
    const cards = deckContainer.querySelectorAll('.tarot-card-small');
    cards.forEach(card => card.classList.add('shuffling'));

    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clear and show shuffled deck for selection
    overlay.innerHTML = '';
    const cardContainer = document.createElement('div');
    cardContainer.className = 'cards-circle';
    
    const shuffledCards = this.cards.sort(() => Math.random() - 0.5);
    
    shuffledCards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'tarot-card-selectable';
      cardElement.innerHTML = `<img src="${getBackOfTheCard()}" alt="Card Back">`;
      
      const totalCards = shuffledCards.length;
      const angle = (360 / totalCards) * index;
      const radian = (angle * Math.PI) / 180;
      const radius = 200;
      
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;
      
      // 计算向圆心移动的方向和目标位置
      const targetX = Math.cos(radian) * (radius - 20);
      const targetY = Math.sin(radian) * (radius - 20);
      
      // 设置CSS变量以供hover使用
      cardElement.style.setProperty('--targetX', `${targetX}px`);
      cardElement.style.setProperty('--targetY', `${targetY}px`);
      cardElement.style.setProperty('--angle', `${angle + 90}deg`);
      
      cardElement.style.transform = `
        translate(${x}px, ${y}px)
        rotate(${angle + 90}deg)
      `;
      
      cardElement.addEventListener('click', () => {
        this.selectCard(card, cardElement);
      });
      
      cardContainer.appendChild(cardElement);
    });
    
    overlay.appendChild(cardContainer);
  }

  createCardDeck() {
    const deckContainer = document.createElement('div');
    deckContainer.className = 'tarot-deck';
    
    this.cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'tarot-card-small';
      cardElement.innerHTML = `<img src="${getBackOfTheCard()}" alt="Card Back">`;
      cardElement.style.transform = `rotate(${Math.random() * 360}deg)`;
      cardElement.style.left = `${Math.random() * 60}%`;
      cardElement.style.top = `${Math.random() * 60}%`;
      deckContainer.appendChild(cardElement);
    });

    this.readingArea.innerHTML = '';
    this.readingArea.appendChild(deckContainer);
    this.readingArea.style.display = 'block';
  }

  async selectCard(card, element) {
    if (this.selectedCards.length >= 3) return;

    const isReversed = Math.random() < 0.5;
    this.selectedCards.push({
      ...card,
      isReversed,
      position: ['过去', '现在', '未来'][this.selectedCards.length]
    });

    element.classList.add('selected');
    element.style.pointerEvents = 'none';

    if (this.selectedCards.length === 3) {
      console.log("selectCard");
        // 移除浮层
        const overlay = document.querySelector('.tarot-overlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for fade out
            overlay.remove();
        }

        this.presentReadingResult();
        
        // 获取AI解读
        await this.getAIInterpretation(this.questionInput.value);
    }
}

presentReadingResult() {
    // Hide input section elements
    this.tarotSection.style.display = 'none';

    const readingResult = this.prepareReadingResult();
    this.readingArea.style.display = 'block';
    this.readingArea.innerHTML = '';

    // Create back button with SVG arrow
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = ICON.BACK_ARROW;
    backButton.addEventListener('click', () => this.resetToInitialState());

    // Create container for reading result with back button
    const container = document.createElement('div');
    container.className = 'reading-container';
    container.appendChild(backButton);
    container.appendChild(readingResult);

    this.readingArea.appendChild(container);

    // Animation
    this.readingArea.style.opacity = '0';
    requestAnimationFrame(() => {
        this.readingArea.style.transition = 'opacity 0.5s ease-in';
        this.readingArea.style.opacity = '1';
    });
}

// 添加新的辅助方法来准备阅读结果
prepareReadingResult() {
    console.log("prepareReadingResult");
    const readingResult = document.createElement('div');
    readingResult.className = 'reading-result';
    
    const cardsDisplay = document.createElement('div');
    cardsDisplay.className = 'selected-cards';
    
    this.selectedCards.forEach(card => {
        console.log("prepareReadingResult card", card);
        const cardElement = document.createElement('div');
        cardElement.className = 'tarot-card-result';
        cardElement.innerHTML = `
            <img src="${card.image}" 
                 alt="${card.name}" 
                 style="transform: rotate(${card.isReversed ? '180' : '0'}deg)">
            <div class="card-info">
                <h4>${card.position}</h4>
                <p>${card.name}${card.isReversed ? '（逆位）' : '（正位）'}</p>
            </div>
        `;
        cardsDisplay.appendChild(cardElement);
    });

    readingResult.appendChild(cardsDisplay);
    
    const interpretationElement = document.createElement('div');
    interpretationElement.className = 'interpretation-text';
    readingResult.appendChild(interpretationElement);
    
    return readingResult;
}

resetToInitialState() {
    // Show input elements
    this.tarotSection.style.display = 'block';
    
    // Clear reading area
    this.readingArea.innerHTML = '';
    
    // Reset selected cards
    this.selectedCards = [];
    
    // Clear question input
    this.questionInput.value = '';
}

  async showReadingResult() {
    const question = this.questionInput.value;
    const readingResult = document.createElement('div');
    readingResult.className = 'reading-result';
    
    const cardsDisplay = document.createElement('div');
    cardsDisplay.className = 'selected-cards';
    
    this.selectedCards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'tarot-card-result';
      cardElement.innerHTML = `
        <img src="${card.image}" 
             alt="${card.name}" 
             style="transform: rotate(${card.isReversed ? '180' : '0'}deg)">
        <div class="card-info">
          <h4>${card.position}</h4>
          <p>${card.name}${card.isReversed ? '（逆位）' : '（正位）'}</p>
        </div>
      `;
      cardsDisplay.appendChild(cardElement);
    });

    readingResult.appendChild(cardsDisplay);

    // Create interpretation container first
    const interpretationElement = document.createElement('div');
    interpretationElement.className = 'interpretation-text';
    readingResult.appendChild(interpretationElement);

    // Now add to DOM so querySelector can find it
    this.readingArea.innerHTML = '';
    this.readingArea.appendChild(readingResult);

    // Get AI interpretation
    await this.getAIInterpretation(question);
  }

  async getAIInterpretation(question) {
    const messages = [...tarotPrompt,
      {
        role: "user",
        content: `问题：${question}\n\n抽到的牌：\n${this.selectedCards.map(card => 
          `${card.position}：${card.name}${card.isReversed ? '（逆位）' : '（正位）'}`
        ).join('\n')}\n\n请为我解读这个牌阵。`
      }
    ];

    try {
      let accumulatedText = '';
      await callAzureAPI(messages, (result) => {
        const interpretationElement = document.querySelector('.interpretation-text');
        if (interpretationElement) {
          // 使用 marked 转换累积的文本并更新显示
          interpretationElement.innerHTML = marked(result);
          // 滚动到新内容
          interpretationElement.style.opacity = '0';
          requestAnimationFrame(() => {
            interpretationElement.style.transition = 'opacity 1s ease-in';
            interpretationElement.style.opacity = '1';
          });
        }
      });
      return accumulatedText;
    } catch (error) {
      console.error('塔罗牌解读失败：', error);
      return '## 解读失败\n\n抱歉，塔罗牌解读遇到了一些问题，请稍后再试。';
    }
  }
}