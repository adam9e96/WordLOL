async function loadDailyWords() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');
    const wordCardsEl = document.getElementById('word-cards');

    try {
        // 로딩 표시
        loadingEl.classList.remove('d-none');
        wordCardsEl.innerHTML = ''; // 기존 내용 초기화

        const response = await fetch('/api/v1/words/daily');

        if (!response.ok) {
            throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }

        const words = await response.json();

        // 로딩 표시 제거
        loadingEl.classList.add('d-none');

        if (words.length === 0) {
            errorEl.textContent = '단어를 찾을 수 없습니다.';
            errorEl.classList.remove('d-none');
        } else {
            renderWords(words);
        }
    } catch (error) {
        console.error('단어 로딩 실패:', error);

        // 로딩 표시 제거
        loadingEl.classList.add('d-none');

        // 에러 메시지 표시
        errorEl.textContent = `단어를 불러오는 중 오류가 발생했습니다: ${error.message}`;
        errorEl.classList.remove('d-none');
    }
}

/**
 * 단어 목록을 HTML 로 렌더링합니다.
 * @param words 단어 목록
 */
function renderWords(words) {
    const container = document.getElementById('word-cards');

    const html = words.map(word => `
        <div class="word-card">
            <div class="card-content">
                <div class="vocabulary">${word.vocabulary}</div>
                <div class="meaning">${word.meaning}</div>
                <div class="difficulty">${getDifficultyStars(word.difficulty)}</div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}


function getDifficultyStars(level) {
    return '<i class="bi bi-star-fill"></i>'.repeat(level);
}

// 페이지 로드 시 단어 불러오기
document.addEventListener('DOMContentLoaded', loadDailyWords);