import apiService from '../utils/api-service.js';
import modalService from "../utils/modal-service.js";

const state = {
    currentCategory: 'ALL',
    isLoading: false,
    wordBooks: [],
    deleteWordBookId: null
};

const elements = {
    wordBookList: document.getElementById('wordBookList'),
    filterChips: document.querySelectorAll('.filter-chip'),
    contentContainer: document.querySelector('.content-container'),
    topSection: document.querySelector('.top-section'),
    wordbooksSection: document.querySelector('.wordbooks-section'),
    createWordBook: document.getElementById('create-btn')
};

/**
 * 페이지 가시성 변경 감지 설정
 * 페이지가 다시 보일 때 데이터 새로고침
 */
function setupVisibilityChangeDetection() {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            console.log('페이지 다시 표시됨, 데이터 갱신');
            loadWordBooks();
        }
    });
}

/**
 * 브라우저 히스토리 변경 감지 설정
 * 뒤로가기/앞으로가기로 돌아왔을 때 데이터 새로고침
 */
function setupHistoryChangeDetection() {
    window.addEventListener('pageshow', (event) => {
        // persisted가 true이면 페이지가 브라우저 캐시에서 복원된 것임
        if (event.persisted) {
            console.log('캐시에서 페이지 복원됨, 데이터 갱신');
            loadWordBooks();
        }
    });

    // 뒤로가기/앞으로가기를 감지하는 추가 방법
    window.addEventListener('popstate', () => {
        console.log('히스토리 탐색 감지됨 (뒤로/앞으로가기), 데이터 갱신');
        loadWordBooks();
    });
}

function setupEventListeners() {
    // 카테고리 필터 이벤트
    elements.filterChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            const category = e.currentTarget.getAttribute('data-category');
            if (category) {
                filterByCategory(category);
            }
        });
    });
    elements.createWordBook.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/wordbook/create');
    })

    // 테마 변경 이벤트 감지
    document.addEventListener('themechange', (event) => {
        updateCardTheme(event.detail.theme);
    });

}

/**
 * 카드 테마 업데이트
 * @param {string} theme - 테마 (dark 또는 light)
 */
function updateCardTheme(theme) {
    const cards = document.querySelectorAll('.wordbook-card');
    cards.forEach(card => {
        if (theme === 'dark') {
            card.setAttribute('data-theme', 'dark');
        } else {
            card.removeAttribute('data-theme');
        }
    });
}

async function loadWordBooks() {
    try {
        state.isLoading = true;
        renderLoadingState();

        let response;
        if (state.currentCategory === 'ALL') {
            // 모든 단어장 목록 조회
            response = await apiService.getAllWordBooks();
        } else {
            // 카테고리별 단어장 목록 조회
            response = await apiService.getWordBooksByCategory(state.currentCategory);
        }

        // 응답 처리
        state.wordBooks = response;

        // 빈 배열 체크 - 카테고리는 존재하지만 단어장이 없는 경우
        if (state.wordBooks.length === 0) {
            renderEmptyState();
        } else {
            renderWordBookList();
        }
    } catch (error) {
        console.error('단어장 목록 로딩 오류:', error.message);

        const categoryName = getCategoryDisplayName(state.currentCategory);
        window.showErrorToast(`${categoryName} 카테고리 로딩 중 오류가 발생했습니다.`, {
            title: '데이터 로드 오류'
        });

        // 빈 상태 렌더링 (사용자에게 UI 표시)
        renderEmptyState();
    } finally {
        state.isLoading = false;
    }
}

/**
 * 카테고리별 필터링
 * @param {string} category - 필터링할 카테고리
 */
function filterByCategory(category) {
    state.currentCategory = category;
    updateActiveFilterChip();
    loadWordBooks();
}

/**
 * 활성화된 필터 칩 업데이트
 */
function updateActiveFilterChip() {
    elements.filterChips.forEach(chip => {
        chip.classList.remove('active');
        const chipCategory = chip.getAttribute('data-category');
        if (chipCategory === state.currentCategory) {
            chip.classList.add('active');
        }
    });
}

/**
 * 단어장 삭제 확인 모달 표시
 * @param {number} id - 삭제할 단어장 ID
 */
function confirmDelete(id) {
    state.deleteWordBookId = id;

    // 모달 서비스를 사용하여 삭제 확인 모달 표시
    modalService.createDeleteConfirmModal(id, async (confirmedId) => {
        await deleteWordBook(confirmedId);
    });
}

/**
 * 단어장 삭제 처리
 * @param {number} id - 삭제할 단어장 ID
 */
async function deleteWordBook(id) {
    await apiService.deleteWordBook(id);
    modalService.closeAllModals();
    window.showSuccessToast('단어장이 삭제되었습니다.');
    loadWordBooks();
}

/**
 * 단어장 목록 렌더링
 */
function renderWordBookList() {
    if (state.wordBooks.length === 0) {
        renderEmptyState();
        return;
    }

    elements.wordBookList.innerHTML = state.wordBooks.map(
        book => createWordBookCard(book))
        .join('');

    // 카드에 다크 테마 데이터 속성 추가
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        updateCardTheme('dark');
    }
}

/**
 * 단어장 카드 HTML 생성
 * @param {Object} book - 단어장 정보
 * @returns {string} - 단어장 카드 HTML
 */
function createWordBookCard(book) {
    return `
        <div class="wordbook-card">
            <div class="category-chip">
                <i class="bi ${getCategoryIcon(book.category)}"></i>
                ${getCategoryDisplayName(book.category)}
            </div>
            <div class="card-header-container">
                <h3 class="card-name">${book.name}</h3>
            </div>
            <p class="card-description">${book.description}</p>
            <div class="card-footer">
                <div class="word-count">
                    <i class="bi bi-book"></i>
                    <span>단어 ${book.wordCount}개</span>
                </div>
                <div class="control-section">
                    <button class="card-btn btn-view" 
                            onclick="navigateTo('/wordbook/${book.id}/view')"
                            title="상세 조회">
                        <i class="bi bi-eye"></i>
                        <span>조회</span>
                    </button>
                    <button class="card-btn btn-study" 
                            onclick="navigateTo('/wordbook/${book.id}/study')"
                            title="학습 시작">
                        <i class="bi bi-play-fill"></i>
                        <span>학습</span>
                    </button>
                    <button class="card-btn btn-edit"
                            onclick="navigateTo('/wordbook/${book.id}/edit')"
                            title="단어장 수정">
                        <i class="bi bi-pencil"></i>
                        <span>수정</span>
                    </button>
                    <button class="card-btn btn-delete"
                            onclick="confirmDelete(${book.id})"
                            title="단어장 삭제">
                        <i class="bi bi-trash"></i>
                        <span>삭제</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function navigateTo(url) {
    location.href = url;
}

/**
 * 로딩 상태 렌더링
 */
function renderLoadingState() {
    elements.wordBookList.innerHTML = `
        <div class="loading-state">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">로딩중...</span>
            </div>
            <p>단어장 목록을 불러오는 중입니다...</p>
        </div>
    `;
}

/**
 * 빈 상태 렌더링
 */
function renderEmptyState() {
    elements.wordBookList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="bi bi-journal-x"></i>
            </div>
            <h3 class="empty-state-title">단어장이 없습니다</h3>
            <p class="empty-state-message">${state.currentCategory === 'ALL'
        ? '아직 등록된 단어장이 없습니다. 새 단어장을 만들어보세요!'
        : `'${getCategoryDisplayName(state.currentCategory)}' 카테고리에 해당하는 단어장이 없습니다.`}</p>
            <button class="btn btn-check-answer" onclick="navigateTo('/wordbook/create')">
                <i class="bi bi-plus-lg"></i>
                새 단어장 만들기
            </button>
        </div>
    `;
}

/**
 * 카테고리 아이콘 가져오기
 * @param {string} category - 카테고리
 * @returns {string} - 아이콘 클래스
 */
function getCategoryIcon(category) {
    const icons = {
        'TOEIC': 'bi-journal-text',
        'TOEFL': 'bi-journal-medical',
        'CSAT': 'bi-journal-check',
        'CUSTOM': 'bi-journal-plus'
    };
    return icons[category] || 'bi-journal';
}

/**
 * 카테고리 표시 이름 가져오기
 * @param {string} category - 카테고리
 * @returns {string} - 표시 이름
 */
function getCategoryDisplayName(category) {
    const categoryMap = {
        'ALL': '전체',
        'TOEIC': '토익',
        'TOEFL': '토플',
        'CSAT': '수능',
        'CUSTOM': '사용자 정의'
    };
    return categoryMap[category] || category;
}

/**
 * 카테고리 맵 가져오기
 * @returns {Object} - 카테고리 맵
 */
function getCategoryMap() {
    return {
        'ALL': '전체',
        'TOEIC': '토익',
        'TOEFL': '토플',
        'CSAT': '수능',
        'CUSTOM': '사용자 정의'
    };
}

/**
 * 초기화 함수
 */
function initialize() {
    console.log('단어장 목록 초기화...');

    // HTML에 data-category 속성 설정
    document.querySelectorAll('.filter-chip').forEach(chip => {
        const categoryText = chip.textContent.trim();
        // 텍스트에서 카테고리 추출
        for (const [key, value] of Object.entries(getCategoryMap())) {
            if (categoryText.includes(value)) {
                chip.setAttribute('data-category', key);
                break;
            }
        }
    });

    // 이벤트 리스너 및 기타 설정
    setupVisibilityChangeDetection();
    setupHistoryChangeDetection();
    setupEventListeners();
    updateActiveFilterChip();

    // 데이터 로드
    loadWordBooks();

    console.log('단어장 목록 초기화 완료');
}

// 전역 함수 노출
window.filterByCategory = filterByCategory;
window.navigateTo = navigateTo;
window.confirmDelete = confirmDelete;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initialize);