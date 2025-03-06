import { marked } from '../node_modules/marked/lib/marked.esm.js';
import { getAllTarotCards, getBackOfTheCard, callAzureAPI } from '../helper.js';
import { ICON } from '../icon.js';
import { SPREADS } from '../constant.js';

export class TarotReading {
  constructor() {
    this.cards = getAllTarotCards();
    this.selectedCards = [];
    this.selectedSpread = null;
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

    this.showSpreadSelector();
  }

  showSpreadSelector() {
    const overlay = document.createElement('div');
    overlay.className = 'tarot-overlay spread-selector';

    const container = document.createElement('div');
    container.className = 'spread-selector-container';

    const title = document.createElement('h2');
    title.textContent = '选择牌阵';
    container.appendChild(title);

    Object.values(SPREADS).forEach(spread => {
      const spreadCard = document.createElement('div');
      spreadCard.className = 'spread-card';
      spreadCard.innerHTML = `
        <h3>${spread.name}</h3>
        <p>${spread.description}</p>
        <div class="spread-info">需要抽取 ${spread.count} 张牌</div>
      `;

      spreadCard.addEventListener('click', () => {
        this.selectedSpread = spread;
        overlay.remove();
        this.showShufflingOverlay();
      });

      container.appendChild(spreadCard);
    });

    overlay.appendChild(container);
    document.body.appendChild(overlay);
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
      cardElement.style.left = `${Math.random() * 80}%`;
      cardElement.style.top = `${Math.random() * 80}%`;
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
    
    // Add counter text
    const counterText = document.createElement('div');
    counterText.className = 'cards-counter';
    counterText.textContent = `请抽取 ${this.selectedSpread.count} 张牌`;
    overlay.appendChild(counterText);
    
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

  async selectCard(card, element) {
    if (this.selectedCards.length >= this.selectedSpread.count) return;

    const isReversed = Math.random() < 0.5;
    this.selectedCards.push({
      ...card,
      isReversed,
      position: this.selectedSpread.positions[this.selectedCards.length]
    });

    element.classList.add('selected');
    element.style.pointerEvents = 'none';

    // Update counter text
    const counterText = document.querySelector('.cards-counter');
    const remainingCards = this.selectedSpread.count - this.selectedCards.length;
    if (counterText && remainingCards > 0) {
        counterText.textContent = `还需抽取 ${remainingCards} 张牌`;
    }

    if (this.selectedCards.length === this.selectedSpread.count) {
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
    const messages = [...this.selectedSpread.prompt,
      {
        role: "user",
        content: `问题：${question}\n\n抽到的牌：\n${this.selectedCards.map(card => 
          `${card.position}：${card.name}${card.isReversed ? '（逆位）' : '（正位）'}`
        ).join('\n')}\n\n请为我解读这个牌阵。`
      }
    ];

    try {
        const interpretationElement = document.querySelector('.interpretation-text');
        if (!interpretationElement) return;

        // Create conversation container
        const conversationContainer = document.createElement('div');
        conversationContainer.className = 'conversation-container';
        interpretationElement.appendChild(conversationContainer);

        // Show loading state
        conversationContainer.innerHTML = '<div class="loading">正在解读塔罗牌...</div>';
        
        // Wait for the complete response
        await new Promise((resolve) => {
            callAzureAPI(messages, (result) => {
                conversationContainer.innerHTML = marked(result);
            }, () => {
                // Streaming complete callback
                conversationContainer.style.opacity = '0';
                requestAnimationFrame(() => {
                    conversationContainer.style.transition = 'opacity 1s ease-in';
                    conversationContainer.style.opacity = '1';
                    resolve();
                });
            });
        });

        // Add follow-up section after conversation container
        this.createFollowUpSection(interpretationElement);
    } catch (error) {
        console.error('塔罗牌解读失败：', error);
        interpretationElement.innerHTML = marked('## 解读失败\n\n抱歉，塔罗牌解读遇到了一些问题，请稍后再试。');
    }
}

createFollowUpSection(container) {
    // Create or get follow-up section
    let followUpSection = container.querySelector('.follow-up-section');
    if (!followUpSection) {
        followUpSection = document.createElement('div');
        followUpSection.className = 'follow-up-section';
        container.appendChild(followUpSection);
    }

    // Create follow-up button
    const button = document.createElement('button');
    button.className = 'continue-button';
    button.textContent = '我想再聊聊';

    // Create input area
    const inputArea = document.createElement('div');
    inputArea.className = 'continue-input hidden';
    inputArea.innerHTML = `
        <textarea class="follow-up-textarea" placeholder="请输入你想进一步了解的内容..." rows="3"></textarea>
        <button class="submit-follow-up">发送</button>
    `;

    // Handle button click
    button.addEventListener('click', () => {
        button.classList.add('hidden');
        inputArea.classList.remove('hidden');
        inputArea.querySelector('textarea').focus();
    });

    // Handle submit
    inputArea.querySelector('.submit-follow-up').addEventListener('click', async () => {
        const followUpQuestion = inputArea.querySelector('textarea').value.trim();
        if (!followUpQuestion) return;

        // Hide follow-up section completely
        followUpSection.classList.add('hidden');

        // Add user question to conversation
        const userQuestion = document.createElement('div');
        userQuestion.className = 'user-question';
        userQuestion.innerHTML = `
            <hr class="conversation-divider">
            <div class="question-content">
                <strong>追问：</strong>
                <p>${marked(followUpQuestion)}</p>
            </div>
        `;
        container.appendChild(userQuestion); // Changed from insertBefore to appendChild

        // Create response container
        const followUpResponse = document.createElement('div');
        followUpResponse.className = 'follow-up-response';
        followUpResponse.innerHTML = '<div class="loading">正在思考中...</div>';
        container.appendChild(followUpResponse); // Changed from insertBefore to appendChild

        try {
            const messages = [
                ...this.selectedSpread.prompt,
                {
                    role: "system",
                    content: "这是一个追问，请基于之前的解读继续深入分析。"
                },
                {
                    role: "assistant",
                    content: `牌阵信息：\n${this.selectedCards.map(card => 
                        `${card.position}：${card.name}${card.isReversed ? '（逆位）' : '（正位）'}`
                    ).join('\n')}\n\n之前的解读：\n${Array.from(container.children)
                        .filter(el => !el.classList.contains('follow-up-section'))
                        .map(el => el.textContent)
                        .join('\n\n')}`
                },
                {
                    role: "user",
                    content: followUpQuestion
                }
            ];

            await new Promise((resolve) => {
                callAzureAPI(messages, (result) => {
                    // Update the response content directly
                    followUpResponse.innerHTML = marked(result);
                    followUpResponse.style.opacity = '0';
                    requestAnimationFrame(() => {
                        followUpResponse.style.transition = 'opacity 0.5s ease-in';
                        followUpResponse.style.opacity = '1';
                    });
                }, async () => {
                    // When streaming is complete
                    // Reset and show follow-up section
                    inputArea.querySelector('textarea').value = '';
                    inputArea.classList.add('hidden');
                    button.classList.remove('hidden');
                    followUpSection.classList.remove('hidden');
                    resolve();
                });
            });

            // Move follow-up section to the end
            container.appendChild(followUpSection);
        } catch (error) {
            console.error('Follow-up interpretation failed:', error);
            followUpResponse.innerHTML = `
                <div class="error-message">
                    <h3>解读失败</h3>
                    <p>抱歉，解读遇到了一些问题，请稍后再试。</p>
                </div>
            `;
            // Show follow-up section even on error
            followUpSection.classList.remove('hidden');
        }
    });

    followUpSection.innerHTML = '';
    followUpSection.appendChild(button);
    followUpSection.appendChild(inputArea);
}
}