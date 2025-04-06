import apiService from '../utils/api-service.js';
import animationService from '../utils/animation-service.js';
import {formatDateTime, getDifficultyStars} from '../utils/formatting-utils.js';

// 애플리케이션 상태 관리 객체
const state = {
    wordBookId: null,
    wordBook: null,
    words: [],
    filteredWords: [],
    isLoading: true,
    searchTerm: '',
    animationServiceReady: false // 애니메이션 서비스 준비 상태 추적
};

// DOM 요소 참조 객체
const elements = {
    container: document.querySelector('.content-container'),
    wordBookName: document.getElementById('wordbook-name'),
    categoryName: document.getElementById('category-name'),
    categoryBadge: document.getElementById('category-badge'),
    wordBookDescription: document.getElementById('wordbook-description'),
    wordCount: document.getElementById('word-count'),
    createdAt: document.getElementById('created-at'),
    updatedAt: document.getElementById('updated-at'),
    wordList: document.getElementById('word-list'),
    searchInput: document.getElementById('search-input'),
    studyBtn: document.getElementById('study-btn'),
    backBtn: document.querySelector('.btn-outline'),
    wordListSection: document.querySelector('.words-section'),
    infoSection: document.querySelector('.wordbook-info-section')
};

/**
 * URL에서 단어장 ID 추출
 * @returns {string|null} 단어장 ID 또는 null
 */
function getWordBookIdFromUrl() {
    try {
        const pathParts = window.location.pathname.split('/');
        const wordBookIndex = pathParts.indexOf('wordbook');
        if (wordBookIndex === -1 || wordBookIndex + 1 >= pathParts.length) {
            return null;
        }
        return pathParts[wordBookIndex + 1];
    } catch (error) {
        console.error('URL에서 단어장 ID 추출 중 오류:', error);
        return null;
    }
}

/**
 * 카테고리 표시 이름 가져오기
 * @param {string} category - 카테고리 코드
 * @returns {string} 카테고리 표시 이름
 */
function getCategoryDisplayName(category) {
    const categoryMap = {
        'TOEIC': '토익',
        'TOEFL': '토플',
        'CSAT': '수능',
        'CUSTOM': '사용자 정의'
    };
    return categoryMap[category] || category;
}

/**
 * 카테고리 CSS 클래스 가져오기
 * @param {string} category - 카테고리 코드
 * @returns {string} CSS 클래스
 */
function getCategoryClass(category) {
    const classMap = {
        'TOEIC': 'category-toeic',
        'TOEFL': 'category-toefl',
        'CSAT': 'category-csat',
        'CUSTOM': 'category-custom'
    };
    return classMap[category] || '';
}

/**
 * 단어장 정보 UI 업데이트
 * @param {Object} wordBook - 단어장 정보
 * @param {number} wordCount - 단어 수
 */
function updateWordBookInfo(wordBook, wordCount) {
    try {
        if (!wordBook) return;

        // 요소 존재 여부 확인 후 텍스트 업데이트
        if (elements.wordBookName) elements.wordBookName.textContent = wordBook.name || '';

        if (elements.categoryName) {
            elements.categoryName.textContent = getCategoryDisplayName(wordBook.category);
        }

        if (elements.categoryBadge) {
            elements.categoryBadge.className = `category-badge ${getCategoryClass(wordBook.category)}`;
        }

        if (elements.wordBookDescription) {
            elements.wordBookDescription.textContent = wordBook.description || '';
        }

        if (elements.wordCount) elements.wordCount.textContent = String(wordCount);

        if (elements.createdAt) {
            elements.createdAt.textContent = formatDateTime(wordBook.createdAt);
        }

        if (elements.updatedAt) {
            elements.updatedAt.textContent = formatDateTime(wordBook.updatedAt);
        }
    } catch (error) {
        console.error('단어장 정보 업데이트 중 오류:', error);
        showErrorToast('단어장 정보를 표시하는 중 오류가 발생했습니다.');
    }
}

/**
 * 단어 목록 렌더링
 * @param {Array} words - 단어 목록
 */
function renderWordList(words) {
    if (!elements.wordList) {
        console.error('단어 목록 요소를 찾을 수 없습니다.');
        return;
    }

    try {
        if (words.length === 0) {
            // 검색어가 있는지 확인하여 다른 메시지 표시
            const searchTerm = elements.searchInput?.value.trim() || '';

            if (searchTerm) {
                // 검색 결과가 없는 경우
                elements.wordList.innerHTML = `
                    <div class="empty-search-state">
                        <div class="empty-icon">
                            <i class="bi bi-search"></i>
                        </div>
                        <h3 class="empty-title">검색 결과가 없습니다</h3>
                        <p class="empty-message">"${searchTerm}"에 해당하는 단어를 찾을 수 없습니다.</p>
                        <button class="btn btn-outline" onclick="document.getElementById('search-input').value = ''; document.getElementById('search-input').dispatchEvent(new Event('input'));">
                            <i class="bi bi-arrow-counterclockwise"></i> 모든 단어 보기
                        </button>
                    </div>
                `;
            } else {
                // 단어가 없는 경우
                elements.wordList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="bi bi-journal-x"></i>
                        </div>
                        <h3 class="empty-title">단어가 없습니다</h3>
                        <p class="empty-message">이 단어장에 등록된 단어가 없습니다.</p>
                    </div>
                `;
            }
            return;
        }

        // 단어 목록 렌더링
        elements.wordList.innerHTML = words.map(word => `
            <div class="word-row">
                <div class="word-vocabulary" data-label="영단어">${word.vocabulary || ''}</div>
                <div class="word-meaning" data-label="의미">${word.meaning || ''}</div>
                <div class="word-hint" data-label="힌트">${word.hint || '-'}</div>
                <div class="word-difficulty" data-label="난이도">${getDifficultyStars(word.difficulty)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('단어 목록 렌더링 중 오류:', error);
        showErrorToast('단어 목록을 표시하는 중 오류가 발생했습니다.');
    }
}

/**
 * 오류 표시
 * @param {string} message - 오류 메시지
 */
function showError(message) {
    // 토스트 메시지로 오류 표시
    showErrorToast(message);

    // UI에 오류 상태 표시
    if (elements.wordList) {
        elements.wordList.innerHTML = `
            <div class="error-message">
                <i class="bi bi-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

/**
 * 에러 토스트 메시지 표시
 * @param {string} message - 오류 메시지
 * @param {Object} options - 토스트 옵션
 */
function showErrorToast(message, options = {}) {
    const defaultOptions = {title: '데이터 로드 오류'};
    const finalOptions = {...defaultOptions, ...options};

    if (window.showErrorToast) {
        window.showErrorToast(message, finalOptions);
    } else {
        console.error(finalOptions.title + ': ' + message);
    }
}

/**
 * 애니메이션 서비스 확인 및 폴백 기능 설정
 * @returns {boolean} 애니메이션 서비스 준비 상태
 */
function ensureAnimationService() {
    // 이미 확인된 경우 상태 반환
    if (state.animationServiceReady) {
        return true;
    }

    // animationService 객체가 존재하는지 확인
    if (!animationService) {
        console.warn('animationService가 로드되지 않았습니다.');
        return false;
    }

    // 필수 메소드가 존재하는지 확인
    const requiredMethods = ['fadeIn', 'fadeOut', 'staggered', 'pulse'];
    const missingMethods = requiredMethods.filter(method => typeof animationService[method] !== 'function');

    if (missingMethods.length > 0) {
        console.warn(`누락된 애니메이션 메소드: ${missingMethods.join(', ')}`);

        // 폴백 구현

        // fadeOut 폴백
        if (!animationService.fadeOut) {
            animationService.fadeOut = function (element, options = {}) {
                const {duration = 300, easing = 'ease', distance = 0, complete = null} = options;

                if (!element) {
                    if (complete) complete();
                    return;
                }

                element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                element.style.opacity = '0';

                if (distance) {
                    element.style.transform = `translateY(${distance}px)`;
                }

                setTimeout(() => {
                    if (complete) complete();
                }, duration);
            };
        }

        // fadeIn 폴백
        if (!animationService.fadeIn) {
            animationService.fadeIn = function (element, options = {}) {
                const {duration = 300, easing = 'ease', distance = 0, delay = 0} = options;

                if (!element) return;

                element.style.opacity = '0';
                if (distance) {
                    element.style.transform = `translateY(${distance}px)`;
                }

                setTimeout(() => {
                    element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, delay);
            };
        }

        // staggered 폴백
        if (!animationService.staggered) {
            animationService.staggered = function (elements, properties, options = {}) {
                const {duration = 300, staggerDelay = 50, easing = 'ease'} = options;

                if (!elements || elements.length === 0) return;

                Array.from(elements).forEach((element, index) => {
                    const delay = index * staggerDelay;

                    element.style.opacity = properties.opacity ? properties.opacity[0] : '0';
                    if (properties.translateX) {
                        element.style.transform = `translateX(${properties.translateX[0]}px)`;
                    }

                    setTimeout(() => {
                        element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
                        element.style.opacity = properties.opacity ? properties.opacity[1] : '1';

                        if (properties.translateX) {
                            element.style.transform = `translateX(${properties.translateX[1]}px)`;
                        }
                    }, delay);
                });
            };
        }

        // pulse 폴백
        if (!animationService.pulse) {
            animationService.pulse = function (element, options = {}) {
                const {scale = 1.1, duration = 300, easing = 'ease', complete = null} = options;

                if (!element) {
                    if (complete) complete();
                    return;
                }

                element.style.transition = `transform ${duration / 2}ms ${easing}`;
                element.style.transform = `scale(${scale})`;

                setTimeout(() => {
                    element.style.transform = 'scale(1)';

                    setTimeout(() => {
                        if (complete) complete();
                    }, duration / 2);
                }, duration / 2);
            };
        }
    }

    // 애니메이션 서비스 준비 완료 표시
    state.animationServiceReady = true;
    return true;
}

/**
 * UI 업데이트
 */
function updateUI() {
    try {
        // 단어장 정보와 단어 목록 업데이트
        updateWordBookInfo(state.wordBook, state.words.length);
        renderWordList(state.filteredWords);

        // 애니메이션 서비스 준비 확인 후 애니메이션 실행
        if (ensureAnimationService()) {
            playContentLoadedAnimation();
        }
    } catch (error) {
        console.error('UI 업데이트 중 오류:', error);
        showErrorToast('화면을 업데이트하는 중 오류가 발생했습니다.');
    }
}

/**
 * 컨텐츠 로드 애니메이션 실행
 */
function playContentLoadedAnimation() {
    try {
        // 애니메이션 서비스 준비 확인
        if (!ensureAnimationService()) {
            return;
        }

        // 요소 존재 확인
        if (elements.infoSection) {
            // 단어장 정보 섹션 애니메이션
            animationService.fadeIn(elements.infoSection, {
                delay: 100,
                duration: 600,
                easing: 'easeOutQuad'
            });
        }

        if (elements.wordListSection) {
            // 단어 섹션 애니메이션
            animationService.fadeIn(elements.wordListSection, {
                delay: 300,
                duration: 600,
                easing: 'easeOutQuad'
            });
        }

        // 단어 행 순차적 애니메이션
        setTimeout(() => {
            const wordRows = document.querySelectorAll('.word-row');
            if (wordRows && wordRows.length > 0) {
                animationService.staggered(wordRows, {
                    opacity: [0, 1],
                    translateX: [10, 0]
                }, {
                    duration: 400,
                    staggerDelay: 50,
                    easing: 'easeOutQuad'
                });
            }
        }, 500);
    } catch (error) {
        console.error('컨텐츠 로드 애니메이션 실행 중 오류:', error);
        // 애니메이션 실패 시 UI는 정상적으로 보이도록 하기 위해 특별한 처리를 하지 않음
    }
}

/**
 * 단어장 데이터 로드
 */
async function loadWordBookData() {
    try {
        // 애니메이션 서비스 준비 확인
        if (ensureAnimationService() && elements.container) {
            // 페이지 로드 애니메이션 실행
            animationService.fadeIn(elements.container, {
                duration: 800,
                easing: 'easeOutCubic'
            });
        }

        // 단어장 ID 확인
        if (!state.wordBookId) {
            throw new Error('단어장 ID가 없습니다.');
        }

        // 병렬로 단어장 정보와 단어 목록 가져오기
        const [wordBook, wordsResponse] = await Promise.all([
            apiService.fetchWordBook(state.wordBookId),
            apiService.fetchWordBookWords(state.wordBookId)
        ]);

        // API 응답 확인 및 처리
        console.log('단어장 정보:', wordBook);
        console.log('단어 목록 응답:', wordsResponse);

        // words가 배열인지 확인하고, 아닌 경우 적절히 처리
        let words = [];
        if (wordsResponse && Array.isArray(wordsResponse)) {
            words = wordsResponse;
        } else if (wordsResponse && wordsResponse.content && Array.isArray(wordsResponse.content)) {
            // API가 페이징 응답을 반환하는 경우
            words = wordsResponse.content;
        } else {
            console.warn('단어 목록이 예상된 형식이 아닙니다:', wordsResponse);
        }

        // 상태 업데이트
        state.wordBook = wordBook;
        state.words = words;
        state.filteredWords = [...words];
        state.isLoading = false;

        // UI 업데이트
        updateUI();
    } catch (error) {
        console.error('데이터 로드 오류:', error);
        showError('단어장 정보를 불러오는데 실패했습니다.');
        state.isLoading = false;
    }
}

/**
 * 검색 결과 애니메이션
 */
function animateSearchResults() {
    try {
        // 애니메이션 서비스 준비 확인
        if (!ensureAnimationService()) {
            // 애니메이션 서비스가 없으면 즉시 결과 렌더링
            renderWordList(state.filteredWords);
            return;
        }

        // 요소 존재 확인
        if (!elements.wordList) {
            renderWordList(state.filteredWords);
            return;
        }

        // 결과 페이드 아웃
        animationService.fadeOut(elements.wordList, {
            duration: 200,
            easing: 'easeOutQuad',
            distance: 10,
            complete: () => {
                // 콜백으로 새 결과 렌더링
                renderWordList(state.filteredWords);

                // 새 결과 페이드 인
                animationService.fadeIn(elements.wordList, {
                    duration: 300,
                    easing: 'easeOutQuad',
                    distance: 10
                });

                // 새 단어 행 순차적 애니메이션
                const wordRows = document.querySelectorAll('.word-row');
                if (wordRows && wordRows.length > 0) {
                    animationService.staggered(wordRows, {
                        opacity: [0, 1],
                        translateX: [10, 0]
                    }, {
                        duration: 400,
                        staggerDelay: 30,
                        easing: 'easeOutQuad'
                    });
                }
            }
        });
    } catch (error) {
        console.error('검색 결과 애니메이션 중 오류:', error);
        // 오류 발생 시 바로 렌더링
        renderWordList(state.filteredWords);
    }
}

/**
 * 검색 처리 함수
 * @param {Event} event - 입력 이벤트
 */
function handleSearch(event) {
    try {
        const searchTerm = event.target.value.toLowerCase().trim();
        state.searchTerm = searchTerm;

        console.log(`검색어: "${searchTerm}"`); // 디버깅용

        // 검색어가 없으면 모든 단어 표시
        if (!searchTerm) {
            state.filteredWords = [...state.words];
        } else {
            // 검색어로 필터링
            state.filteredWords = state.words.filter(word =>
                (word.vocabulary || '').toLowerCase().includes(searchTerm) ||
                (word.meaning || '').toLowerCase().includes(searchTerm) ||
                (word.hint || '').toLowerCase().includes(searchTerm)
            );
        }

        console.log(`필터링된 단어 수: ${state.filteredWords.length}`);

        // 검색 결과 애니메이션 실행
        animateSearchResults();
    } catch (error) {
        console.error('검색 처리 중 오류:', error);
        // 오류 발생 시 필터링 없이 모든 단어 표시
        state.filteredWords = [...state.words];
        renderWordList(state.filteredWords);
    }
}

/**
 * 버튼 클릭 애니메이션
 * @param {HTMLElement} button - 버튼 요소
 * @param {Function} callback - 클릭 후 콜백
 */
function animateButtonClick(button, callback) {
    try {
        // 버튼 요소와 애니메이션 서비스 확인
        if (!button || !ensureAnimationService()) {
            if (callback) callback();
            return;
        }

        // 버튼 애니메이션 실행
        animationService.pulse(button, {
            scale: 1.05,
            duration: 400,
            easing: 'easeInOutBack',
            complete: callback
        });
    } catch (error) {
        console.error('버튼 애니메이션 중 오류:', error);
        // 오류 발생 시 콜백 바로 실행
        if (callback) callback();
    }
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    try {
        // 검색 입력 이벤트
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', handleSearch);
        }

        // 학습 버튼 클릭 이벤트
        if (elements.studyBtn) {
            elements.studyBtn.addEventListener('click', () => {
                animateButtonClick(elements.studyBtn, () => {
                    if (state.wordBookId) {
                        window.location.href = `/wordbook/${state.wordBookId}/study`;
                    } else {
                        console.error('단어장 ID를 찾을 수 없습니다.');
                        showErrorToast('단어장 ID를 찾을 수 없습니다.', {title: '오류'});
                    }
                });
            });
        }

        // 목록으로 버튼 클릭 이벤트
        if (elements.backBtn) {
            elements.backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                animateButtonClick(elements.backBtn, () => {
                    window.location.href = '/wordbook/list';
                });
            });
        }
    } catch (error) {
        console.error('이벤트 리스너 설정 중 오류:', error);
        showErrorToast('페이지 초기화 중 오류가 발생했습니다.');
    }
}

/**
 * 애플리케이션 초기화
 */
async function initialize() {
    try {
        console.log('단어장 상세 보기 초기화 시작');

        // 애니메이션 서비스 준비
        ensureAnimationService();

        // URL에서 단어장 ID 추출
        state.wordBookId = getWordBookIdFromUrl();
        if (!state.wordBookId) {
            throw new Error('단어장 ID를 찾을 수 없습니다.');
        }

        console.log('단어장 ID:', state.wordBookId);

        // 이벤트 리스너 설정
        setupEventListeners();

        // 데이터 로드
        await loadWordBookData();

        console.log('단어장 상세 보기 초기화 완료');
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
        showError('단어장 정보를 불러오는데 실패했습니다.');
        // 초기화 실패 알림 추가
        showErrorToast('단어장을 초기화하는 중 오류가 발생했습니다.', {
            title: '초기화 오류',
            duration: 5000
        });
    }
}

// 페이지 로드 시 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', initialize);