import apiService from '../utils/api-service.js';
import {formatDateTime} from '../utils/formatting-utils.js';
import animationService from '../utils/animation-service.js';

const state = {
    wordBookId: null,
    isProcessing: false
};

const elements = {
    form: document.getElementById('wordBookForm'),
    nameInput: document.getElementById('name'),
    descriptionInput: document.getElementById('description'),
    categorySelect: document.getElementById('category'),
    createdAtInput: document.getElementById('createdAt'),
    updatedAtInput: document.getElementById('updatedAt'),
    wordListContainer: document.getElementById('wordList'),
    submitBtn: document.querySelector('button[type="submit"]')
};

/**
 * URL에서 단어장 ID 추출
 * @returns {string} 추출된 ID
 */
function getWordBookIdFromUrl() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.indexOf('edit') - 1];
}

/**
 * 페이지 초기화
 */
async function initialize() {
    // URL에서 ID 파라미터 추출
    state.wordBookId = getWordBookIdFromUrl();

    // 애니메이션 시작
    animatePageLoad();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 초기 데이터 로드
    await loadWordBook();
}

function setupEventListeners() {
    // 폼 제출 이벤트
    elements.form.addEventListener('submit', handleSubmit);

    // 취소 버튼 이벤트 - 이미 HTML에 onclick="history.back()" 설정됨
}


async function loadWordBook() {
    try {
        startLoadingAnimation();

        // 1. 단어장 기본 정보 조회
        const wordBook = await apiService.fetchWordBook(state.wordBookId);

        // 2. 단어장의 단어 목록 조회
        const words = await apiService.fetchWordBookWords(state.wordBookId);

        console.log('단어장 정보:', wordBook);
        console.log('단어 목록:', words);

        // UI 업데이트
        updateWordBookForm(wordBook);
        clearWordList();

        // 단어 목록 표시 애니메이션과 함께
        if (words && words.length > 0) {
            words.forEach((word, index) => {
                setTimeout(() => {
                    addWordRow(word);
                }, 50 * index); // 각 항목마다 지연 시간을 두어 순차적으로 표시
            });
        } else {
            console.warn('단어 목록이 비어있습니다.');
            // 빈 행 하나 추가
            addWordRow();
        }

        finishLoadingAnimation();
    } catch (error) {
        console.error('Error:', error);
        window.showErrorToast('단어장 로딩 중 오류가 발생했습니다.');
        finishLoadingAnimation();
    }
}

/**
 * 폼 제출 처리
 * @param {Event} e - 제출 이벤트
 */
async function handleSubmit(e) {
    e.preventDefault();

    if (state.isProcessing) return;

    // 폼 유효성 검사
    if (!e.target.checkValidity()) {
        e.stopPropagation();
        e.target.classList.add('was-validated');
        window.showErrorToast('필수 항목을 모두 입력해주세요.');
        return;
    }

    try {
        state.isProcessing = true;
        startSubmitAnimation();

        // 폼 데이터 수집
        const wordBookData = collectFormData();

        // 단어장 수정 API 호출
        await apiService.updateWordBook(state.wordBookId, wordBookData);

        // 성공 알림 및 애니메이션
        window.showSuccessToast('단어장이 성공적으로 수정되었습니다.');

        // 페이지 이동 애니메이션
        animateNavigation(() => {
            window.location.href = '/wordbook/list';
        });
    } catch (error) {
        console.error('Error:', error);
        window.showErrorToast('단어장 수정 중 오류가 발생했습니다.');
        stopSubmitAnimation();
        state.isProcessing = false;
    }
}

/**
 * 폼 데이터 수집
 * @returns {Object} 수집된 단어장 데이터
 */
function collectFormData() {
    const wordRows = document.querySelectorAll('.word-row');
    const words = Array.from(wordRows).map(row => ({
        id: row.querySelector('.word-id').value || null,
        vocabulary: row.querySelector('.vocabulary').value.trim(),
        meaning: row.querySelector('.meaning').value.trim(),
        hint: row.querySelector('.hint').value.trim(),
        difficulty: parseInt(row.querySelector('.difficulty').value)
    }));

    return {
        name: elements.nameInput.value.trim(),
        description: elements.descriptionInput.value.trim(),
        category: elements.categorySelect.value,
        words: words
    };
}

/**
 * 단어장 폼 업데이트
 * @param {Object} wordBook - 단어장 정보
 */
function updateWordBookForm(wordBook) {
    elements.nameInput.value = wordBook.name;
    elements.descriptionInput.value = wordBook.description;
    elements.categorySelect.value = wordBook.category;
    elements.createdAtInput.value = formatDateTime(wordBook.createdAt);
    elements.updatedAtInput.value = formatDateTime(wordBook.updatedAt);
}

/**
 * 단어 목록 초기화
 */
function clearWordList() {
    elements.wordListContainer.innerHTML = '';
}

/**
 * 새 단어 행 추가
 * @param {Object} word - 추가할 단어 객체 (없으면 빈 행 추가)
 */
function addWordRow(word = null) {
    try {
        const wordList = elements.wordListContainer;
        if (!wordList) {
            console.error('단어 목록 컨테이너(#wordList)를 찾을 수 없습니다.');
            return null;
        }

        const row = document.createElement('div');
        row.className = 'word-row';
        row.style.opacity = '0'; // 초기 상태는 투명하게 설정 (애니메이션 위해)

        // 기본값 설정 (word가 null이거나 속성이 없을 경우를 대비)
        const wordId = word && word.id ? word.id : '';
        const vocabulary = word && word.vocabulary ? word.vocabulary : '';
        const meaning = word && word.meaning ? word.meaning : '';
        const hint = word && word.hint ? word.hint : '';
        const difficulty = word && typeof word.difficulty === 'number' ? word.difficulty : 3;

        row.innerHTML = `
            <input type="hidden" class="word-id" value="${wordId}">
            <input type="text" class="form-control vocabulary"
                   value="${vocabulary}"
                   placeholder="영단어" required>
            <input type="text" class="form-control meaning"
                   value="${meaning}"
                   placeholder="의미" required>
            <input type="text" class="form-control hint"
                   value="${hint}"
                   placeholder="힌트">
            <select class="form-select difficulty">
                <option value="1" ${difficulty === 1 ? 'selected' : ''}>Level 1</option>
                <option value="2" ${difficulty === 2 ? 'selected' : ''}>Level 2</option>
                <option value="3" ${difficulty === 3 ? 'selected' : ''}>Level 3</option>
                <option value="4" ${difficulty === 4 ? 'selected' : ''}>Level 4</option>
                <option value="5" ${difficulty === 5 ? 'selected' : ''}>Level 5</option>
            </select>
            <button type="button" class="btn-remove" onclick="removeWordRow(this)">
                <i class="bi bi-trash"></i>
            </button>
        `;

        wordList.appendChild(row);

        // 행에 애니메이션 적용
        animateNewRow(row);

        // 투명도 설정으로 애니메이션이 제대로 동작하지 않는 경우를 대비한 백업 처리
        setTimeout(() => {
            if (parseFloat(row.style.opacity) === 0) {
                row.style.opacity = '1';
            }
        }, 1000);

        return row;
    } catch (error) {
        console.error('단어 행 추가 중 오류 발생:', error);
        return null;
    }
}

/**
 * 단어 행 삭제
 * @param {HTMLElement} button - 삭제 버튼 요소
 */
function removeWordRow(button) {
    const row = button.closest('.word-row');
    if (!row) return;

    const wordList = elements.wordListContainer;
    const rowCount = wordList.querySelectorAll('.word-row').length;

    if (rowCount <= 1) {
        window.showErrorToast('최소 1개의 단어가 필요합니다.');

        // 행 흔들림 애니메이션
        if (animationService && typeof animationService.shake === 'function') {
            animationService.shake(row);
        } else {
            // 기본 CSS 흔들림 효과
            row.style.transition = 'transform 0.1s ease-in-out';
            row.style.transform = 'translateX(-5px)';

            setTimeout(() => {
                row.style.transform = 'translateX(5px)';
                setTimeout(() => {
                    row.style.transform = 'translateX(0)';
                }, 100);
            }, 100);
        }

        return;
    }

    // 애니메이션 서비스가 있는 경우 사용
    if (animationService && typeof animationService.fadeOut === 'function') {
        animationService.fadeOut(row, {
            complete: () => row.remove()
        });
    } else {
        // 기본 CSS 애니메이션
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        row.style.transition = 'opacity 0.3s, transform 0.3s';

        setTimeout(() => {
            row.remove();
        }, 300);
    }
}

// 애니메이션 함수들
function animatePageLoad() {
    if (animationService) {
        animationService.fadeIn('.content-container', {duration: 800});
        animationService.staggered('.form-section', {
            opacity: [0, 1],
            translateY: [15, 0]
        }, {
            staggerDelay: 200,
            duration: 700
        });
    }
}

function startLoadingAnimation() {
    if (animationService) {
        animationService.animate(['.form-section'], {
            opacity: 0.7,
            scale: 0.98
        }, {duration: 400});
    }
}

function finishLoadingAnimation() {
    if (animationService) {
        animationService.animate(['.form-section'], {
            opacity: 1,
            scale: 1
        }, {duration: 400});
    }
}

function animateNewRow(row) {
    if (animationService) {
        animationService.fadeIn(row, {
            distance: 10,
            duration: 500
        });
    } else {
        row.style.opacity = '1';
    }
}

function startSubmitAnimation() {
    if (animationService && elements.submitBtn) {
        animationService.animate(elements.submitBtn, {
            scale: 0.95,
            opacity: 0.8
        }, {duration: 300});

        elements.submitBtn.disabled = true;
    }
}

function stopSubmitAnimation() {
    if (animationService && elements.submitBtn) {
        animationService.animate(elements.submitBtn, {
            scale: 1,
            opacity: 1
        }, {duration: 300});

        elements.submitBtn.disabled = false;
    }
}

function animateNavigation(callback) {
    if (animationService) {
        animationService.animate('.content-container', {
            opacity: 0,
            translateY: -20
        }, {
            duration: 600,
            complete: callback
        });
    } else {
        callback();
    }
}

// 전역 함수 노출 (HTML의 onclick 속성에서 호출하기 위함)
window.addWordRow = addWordRow;
window.removeWordRow = removeWordRow;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('단어장 수정 페이지 초기화 중...');
        await initialize();
        console.log('단어장 수정 페이지 초기화 완료');
    } catch (error) {
        console.error('애플리케이션 초기화 중 예외 발생:', error);

        // 심각한 오류 발생 시 사용자에게 알림
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger';
        errorMessage.textContent = '페이지 로드 중 오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해 주세요.';

        const container = document.querySelector('.content-container');
        if (container) {
            container.prepend(errorMessage);
        } else {
            document.body.prepend(errorMessage);
        }
    }
});