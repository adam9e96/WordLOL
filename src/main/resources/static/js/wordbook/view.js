// 상수 및 상태 관리
const API_BASE_URL = '/api/v1/wordbooks';
const State = {
    wordBook: null,
    words: [],
    filteredWords: []
};

// DOM 요소 캐싱
const Elements = {
    wordBookName: document.getElementById('wordbook-name'),
    categoryName: document.getElementById('category-name'),
    categoryBadge: document.getElementById('category-badge'),
    wordBookDescription: document.getElementById('wordbook-description'),
    wordCount: document.getElementById('word-count'),
    createdAt: document.getElementById('created-at'),
    updatedAt: document.getElementById('updated-at'),
    wordList: document.getElementById('word-list'),
    searchInput: document.getElementById('search-input'),
    studyBtn: document.getElementById('study-btn')
};

// 초기화 함수
async function initialize() {
    try {
        await loadWordBookData();
        setupEventListeners();
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
        showError('단어장 정보를 불러오는데 실패했습니다.');
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 검색 입력 이벤트
    Elements.searchInput.addEventListener('input', handleSearch);

    // 학습 버튼 클릭 이벤트
    Elements.studyBtn.addEventListener('click', () => {
        location.href = `/wordbook/${wordBookId}/study`;
    });
}

// 단어장 데이터 로드
async function loadWordBookData() {
    // 단어장 기본 정보와 단어 목록을 병렬로 가져오기
    const [wordBookResponse, wordsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/${wordBookId}`),
        fetch(`${API_BASE_URL}/${wordBookId}/words`)
    ]);

    if (!wordBookResponse.ok || !wordsResponse.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
    }

    State.wordBook = await wordBookResponse.json();
    State.words = await wordsResponse.json();
    State.filteredWords = [...State.words];
    // 전체 객체 구조 확인
    console.log("전체 단어장 정보:", State.wordBook);
    console.log("단어 목록 길이:", State.words.length);


    updateUI();
}

// UI 업데이트
function updateUI() {
    updateWordBookInfo();
    renderWordList();
}

// 단어장 정보 업데이트
function updateWordBookInfo() {
    const {wordBook} = State;

    Elements.wordBookName.textContent = wordBook.name;
    Elements.categoryName.textContent = getCategoryDisplayName(wordBook.category);
    Elements.categoryBadge.className = `category-badge ${getCategoryClass(wordBook.category)}`;
    Elements.wordBookDescription.textContent = wordBook.description;
    Elements.wordCount.textContent = String(State.words.length);
    Elements.createdAt.textContent = formatDateTime(wordBook.createdAt);
    Elements.updatedAt.textContent = formatDateTime(wordBook.updatedAt);
}

// 단어 목록 렌더링
function renderWordList() {
    const {filteredWords} = State;

    if (filteredWords.length === 0) {
        Elements.wordList.innerHTML = '<div class="empty-state">단어가 없습니다.</div>';
        return;
    }

    Elements.wordList.innerHTML = filteredWords.map(word => `
        <div class="word-row">
            <div class="word-vocabulary" data-label="영단어">${word.vocabulary}</div>
            <div class="word-meaning" data-label="의미">${word.meaning}</div>
            <div class="word-hint" data-label="힌트">${word.hint || '-'}</div>
            <div class="word-difficulty" data-label="난이도">${getDifficultyStars(word.difficulty)}</div>
        </div>
    `).join('');
}

// 검색 처리
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();

    if (!searchTerm) {
        State.filteredWords = [...State.words];
    } else {
        State.filteredWords = State.words.filter(word =>
            word.vocabulary.toLowerCase().includes(searchTerm) ||
            word.meaning.toLowerCase().includes(searchTerm) ||
            (word.hint && word.hint.toLowerCase().includes(searchTerm))
        );
    }

    renderWordList();
}

// 카테고리 표시 이름 가져오기
function getCategoryDisplayName(category) {
    const categoryMap = {
        'TOEIC': '토익',
        'TOEFL': '토플',
        'CSAT': '수능',
        'CUSTOM': '사용자 정의'
    };
    return categoryMap[category] || category;
}

// 카테고리 CSS 클래스 가져오기
function getCategoryClass(category) {
    const classMap = {
        'TOEIC': 'category-toeic',
        'TOEFL': 'category-toefl',
        'CSAT': 'category-csat',
        'CUSTOM': 'category-custom'
    };
    return classMap[category] || '';
}

// 난이도 별표 가져오기
function getDifficultyStars(level) {
    return '<i class="bi bi-star-fill"></i>'.repeat(level);
}

// 날짜 포맷팅
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 오류 표시
function showError(message) {
    Elements.wordList.innerHTML = `
        <div class="error-message">
            <i class="bi bi-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initialize);