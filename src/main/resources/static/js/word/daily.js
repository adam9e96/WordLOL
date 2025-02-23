// 상태 및 설정 관리
const State = {
    API_URL: '/api/v1/words/daily'
};

// DOM 요소 캐싱
const Elements = {
    loading: document.getElementById('loading'),
    error: document.getElementById('error-message'),
    wordCards: document.getElementById('word-cards')
};

// UI 관리
const UIManager = {
    showLoading() {
        Elements.loading.classList.remove('d-none');
        Elements.wordCards.innerHTML = '';
        Elements.error.classList.add('d-none');
    },

    hideLoading() {
        Elements.loading.classList.add('d-none');
    },

    showError(message) {
        Elements.error.textContent = message;
        Elements.error.classList.remove('d-none');
    },

    getDifficultyStars(level) {
        return '<i class="bi bi-star-fill"></i>'.repeat(level);
    },

    createWordCard(word) {
        return `
            <div class="word-card">
                <div class="card-content">
                    <div class="vocabulary">${word.vocabulary}</div>
                    <div class="meaning">${word.meaning}</div>
                    <div class="difficulty">${this.getDifficultyStars(word.difficulty)}</div>
                </div>
            </div>
        `;
    },

    renderWords(words) {
        Elements.wordCards.innerHTML = words
            .map(word => this.createWordCard(word))
            .join('');
    }
};

// API 통신
const ApiService = {
    async fetchDailyWords() {
        const response = await fetch(State.API_URL);
        if (!response.ok) {
            throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }
        return response.json();
    }
};

// 일일 단어 관리
const DailyWordsManager = {
    async loadDailyWords() {
        try {
            UIManager.showLoading();

            const words = await ApiService.fetchDailyWords();

            if (words.length === 0) {
                UIManager.showError('단어를 찾을 수 없습니다.');
                return;
            }

            UIManager.renderWords(words);
        } catch (error) {
            console.error('단어 로딩 실패:', error);
            UIManager.showError(`단어를 불러오는 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            UIManager.hideLoading();
        }
    }
};

// 초기화
function initialize() {
    DailyWordsManager.loadDailyWords().then(() => console.log("단어 로딩"));
}

// 앱 시작
document.addEventListener('DOMContentLoaded', initialize);