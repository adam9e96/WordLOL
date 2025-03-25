/**
 * 단어장 수정 애플리케이션
 */
class WordBookEditApp {
    constructor() {
        this.API_BASE_URL = '/api/v1/wordbooks';
        this.API_BASE_URL_WORD = '/api/v1/words';

        // URL에서 ID 파라미터 추출
        this.wordBookId = this.getWordBookIdFromUrl();
        this.isProcessing = false;
        this.uiManager = new UIManager();
        this.apiService = new ApiService(this.API_BASE_URL, this.API_BASE_URL_WORD);
        this.animationManager = new AnimationManager();
    }

    /**
     * URL에서 단어장 ID 추출
     * @returns {string} 추출된 ID
     */
    getWordBookIdFromUrl() {
        const pathSegments = window.location.pathname.split('/');
        return pathSegments[pathSegments.indexOf('edit') - 1];
    }

    /**
     * 애플리케이션 초기화
     */
    async initialize() {
        // 페이지 로드 애니메이션
        this.animationManager.animatePageLoad();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 데이터 로드
        await this.loadWordBook();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 폼 제출 이벤트
        document.getElementById('wordBookForm').addEventListener('submit', (e) => this.handleSubmit(e));

        // 단어 추가 버튼 클릭 이벤트
        document.querySelectorAll('button[onclick="addWordRow()"]').forEach(button => {
            button.onclick = () => this.addWordRow();
        });
    }

    /**
     * 단어장 데이터 로드
     */
    async loadWordBook() {
        try {
            this.animationManager.startLoadingAnimation();

            // 1. 단어장 기본 정보 조회
            const wordBook = await this.apiService.fetchWordBookDetails(this.wordBookId);

            // 2. 단어장의 단어 목록 조회
            const words = await this.apiService.fetchWordBookWords(this.wordBookId);

            console.log('단어장 정보:', wordBook);
            console.log('단어 목록:', words);

            // UI 업데이트
            this.uiManager.updateWordBookForm(wordBook);
            this.uiManager.clearWordList();

            // 단어 목록 표시 애니메이션과 함께
            if (words && words.length > 0) {
                words.forEach((word, index) => {
                    setTimeout(() => {
                        this.uiManager.addWordRow(word);
                    }, 50 * index); // 각 항목마다 지연 시간을 두어 순차적으로 표시
                });
            } else {
                console.warn('단어 목록이 비어있습니다.');
                // 빈 행 하나 추가
                this.addWordRow();
            }

            this.animationManager.finishLoadingAnimation();
        } catch (error) {
            console.error('Error:', error);
            window.showErrorToast('단어장 로딩 중 오류가 발생했습니다.');
            this.animationManager.finishLoadingAnimation();
        }
    }

    /**
     * 폼 제출 처리
     * @param {Event} e - 제출 이벤트
     */
    async handleSubmit(e) {
        e.preventDefault();

        if (this.isProcessing) return;

        // 폼 유효성 검사
        if (!e.target.checkValidity()) {
            e.stopPropagation();
            e.target.classList.add('was-validated');
            window.showErrorToast('필수 항목을 모두 입력해주세요.');
            return;
        }

        try {
            this.isProcessing = true;
            this.animationManager.startSubmitAnimation();

            // 폼 데이터 수집
            const wordBookData = this.collectFormData();

            // 단어장 수정 API 호출
            await this.apiService.updateWordBook(this.wordBookId, wordBookData);

            // 성공 알림 및 애니메이션
            window.showSuccessToast('단어장이 성공적으로 수정되었습니다.');

            // 페이지 이동 애니메이션
            this.animationManager.animateNavigation(() => {
                window.location.href = '/wordbook/list';
            });
        } catch (error) {
            console.error('Error:', error);
            window.showErrorToast('단어장 수정 중 오류가 발생했습니다.');
            this.animationManager.stopSubmitAnimation();
            this.isProcessing = false;
        }
    }

    /**
     * 폼 데이터 수집
     * @returns {Object} 수집된 단어장 데이터
     */
    collectFormData() {
        const wordRows = document.querySelectorAll('.word-row');
        const words = Array.from(wordRows).map(row => ({
            id: row.querySelector('.word-id').value || null,
            vocabulary: row.querySelector('.vocabulary').value.trim(),
            meaning: row.querySelector('.meaning').value.trim(),
            hint: row.querySelector('.hint').value.trim(),
            difficulty: parseInt(row.querySelector('.difficulty').value)
        }));

        return {
            name: document.getElementById('name').value.trim(),
            description: document.getElementById('description').value.trim(),
            category: document.getElementById('category').value,
            words: words
        };
    }

    /**
     * 새 단어 행 추가
     * @param {Object} word - 추가할 단어 객체 (없으면 빈 행 추가)
     */
    addWordRow(word = null) {
        const newRow = this.uiManager.addWordRow(word);
        if (newRow) {
            this.animationManager.animateNewRow(newRow);
        }
        return newRow;
    }

    /**
     * 단어 행 삭제
     * @param {HTMLElement} button - 삭제 버튼 요소
     */
    removeWordRow(button) {
        const row = button.closest('.word-row');
        if (!row) return;

        const wordList = document.getElementById('wordList');
        const rowCount = wordList.querySelectorAll('.word-row').length;

        if (rowCount <= 1) {
            window.showErrorToast('최소 1개의 단어가 필요합니다.');

            // 행 흔들림 애니메이션 (애니메이션 매니저 없이도 작동하도록)
            row.style.transition = 'transform 0.1s ease-in-out';
            row.style.transform = 'translateX(-5px)';

            setTimeout(() => {
                row.style.transform = 'translateX(5px)';
                setTimeout(() => {
                    row.style.transform = 'translateX(0)';
                }, 100);
            }, 100);

            return;
        }

        if (this.animationManager.isAnimeAvailable) {
            // anime.js가 있으면 애니메이션과 함께 삭제
            this.animationManager.animateRowRemoval(row);
        } else {
            // 기본 효과로 삭제
            row.style.opacity = '0';
            row.style.transform = 'translateY(10px)';
            row.style.transition = 'opacity 0.3s, transform 0.3s';

            setTimeout(() => {
                row.remove();
            }, 300);
        }
    }
}

/**
 * UI 관리 클래스
 * 사용자 인터페이스 업데이트 및 관리
 */
class UIManager {
    /**
     * 단어장 폼 업데이트
     * @param {Object} wordBook - 단어장 정보
     */
    updateWordBookForm(wordBook) {
        document.getElementById('name').value = wordBook.name;
        document.getElementById('description').value = wordBook.description;
        document.getElementById('category').value = wordBook.category;
        document.getElementById('createdAt').value = this.formatDateTime(wordBook.createdAt);
        document.getElementById('updatedAt').value = this.formatDateTime(wordBook.updatedAt);
    }

    /**
     * 단어 목록 초기화
     */
    clearWordList() {
        document.getElementById('wordList').innerHTML = '';
    }

    /**
     * 날짜 포맷팅
     * @param {string} dateTimeStr - 날짜 문자열
     * @returns {string} 포맷된 날짜 문자열
     */
    formatDateTime(dateTimeStr) {
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

    /**
     * 단어 행 추가
     * @param {Object} word - 추가할 단어 객체 (없으면 빈 행 추가)
     * @returns {HTMLElement} 추가된 행 요소
     */
    addWordRow(word = null) {
        try {
            const wordList = document.getElementById('wordList');
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
                <button type="button" class="btn-remove" onclick="app.removeWordRow(this)">
                    <i class="bi bi-trash"></i>
                </button>
            `;

            wordList.appendChild(row);

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
}

/**
 * API 서비스 클래스
 * 서버와의 통신 처리
 */
class ApiService {
    /**
     * 생성자
     * @param {string} baseUrl - 단어장 API 기본 URL
     * @param {string} wordBaseUrl - 단어 API 기본 URL
     */
    constructor(baseUrl, wordBaseUrl) {
        this.baseUrl = baseUrl;
        this.wordBaseUrl = wordBaseUrl;
    }

    /**
     * 단어장 상세 정보 조회
     * @param {string} wordBookId - 단어장 ID
     * @returns {Promise<Object>} 단어장 정보
     */
    async fetchWordBookDetails(wordBookId) {
        const response = await fetch(`${this.baseUrl}/${wordBookId}`);
        if (!response.ok) {
            throw new Error('단어장을 찾을 수 없습니다.');
        }
        return response.json();
    }

    /**
     * 단어장의 단어 목록 조회
     * @param {string} wordBookId - 단어장 ID
     * @returns {Promise<Array>} 단어 목록
     */
    async fetchWordBookWords(wordBookId) {
        try {
            console.log(`단어 목록 조회 요청: ${this.baseUrl}/${wordBookId}/words`);
            const response = await fetch(`${this.baseUrl}/${wordBookId}/words`);

            if (!response.ok) {
                console.error(`API 오류: ${response.status} ${response.statusText}`);
                throw new Error(`단어 목록을 불러올 수 없습니다. (${response.status})`);
            }

            const data = await response.json();
            console.log('API 응답 데이터:', data);
            return data;
        } catch (error) {
            console.error('단어 목록 조회 중 오류 발생:', error);
            // 오류 발생 시 빈 배열 반환 대신 오류를 전파하여 적절한 처리 유도
            throw error;
        }
    }

    /**
     * 단어장 수정
     * @param {string} wordBookId - 단어장 ID
     * @param {Object} wordBookData - 수정할 단어장 데이터
     * @returns {Promise<Object>} API 응답
     */
    async updateWordBook(wordBookId, wordBookData) {
        const response = await fetch(`${this.baseUrl}/${wordBookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(wordBookData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '단어장 수정 중 오류가 발생했습니다.');
        }

        return response.json();
    }
}

/**
 * 애니메이션 관리 클래스
 * anime.js를 활용한 애니메이션 처리
 */
class AnimationManager {
    constructor() {
        this.isAnimeAvailable = typeof anime !== 'undefined';

        // anime.js 이용 가능 여부 확인 로깅
        if (this.isAnimeAvailable) {
            console.log('anime.js가 로드되었습니다. 고급 애니메이션을 사용합니다.');
        } else {
            console.warn('anime.js가 로드되지 않았습니다. 기본 CSS 애니메이션을 사용합니다.');
        }
    }

    /**
     * 페이지 로드 애니메이션
     */
    animatePageLoad() {
        if (!this.isAnimeAvailable) return;

        // 컨테이너 애니메이션
        anime({
            targets: '.content-container',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: 'easeOutExpo'
        });

        // 폼 섹션 애니메이션
        anime({
            targets: '.form-section',
            opacity: [0, 1],
            translateY: [15, 0],
            delay: anime.stagger(200),
            duration: 700,
            easing: 'easeOutExpo'
        });
    }

    /**
     * 로딩 애니메이션 시작
     */
    startLoadingAnimation() {
        if (!this.isAnimeAvailable) return;

        // 컨텐츠 영역 로딩 상태 애니메이션
        anime({
            targets: ['.form-section'],
            opacity: 0.7,
            scale: 0.98,
            duration: 400,
            easing: 'easeInOutQuad'
        });
    }

    /**
     * 로딩 애니메이션 종료
     */
    finishLoadingAnimation() {
        if (!this.isAnimeAvailable) return;

        // 컨텐츠 영역 정상 상태로 복원
        anime({
            targets: ['.form-section'],
            opacity: 1,
            scale: 1,
            duration: 400,
            easing: 'easeOutQuad'
        });
    }

    /**
     * 새 행 추가 애니메이션
     * @param {HTMLElement} row - 애니메이션 적용할 행 요소
     */
    animateNewRow(row) {
        if (!this.isAnimeAvailable) {
            row.style.opacity = '1';
            return;
        }

        anime({
            targets: row,
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 500,
            easing: 'easeOutQuad'
        });
    }

    /**
     * 제출 시작 애니메이션
     */
    startSubmitAnimation() {
        if (!this.isAnimeAvailable) return;

        // 저장 버튼 애니메이션
        const saveButton = document.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = true;
            anime({
                targets: saveButton,
                scale: 0.95,
                opacity: 0.8,
                duration: 300,
                easing: 'easeInOutQuad'
            });
        }
    }

    /**
     * 제출 종료 애니메이션
     */
    stopSubmitAnimation() {
        if (!this.isAnimeAvailable) return;

        // 저장 버튼 원래 상태로 복원
        const saveButton = document.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = false;
            anime({
                targets: saveButton,
                scale: 1,
                opacity: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });
        }
    }

    /**
     * 페이지 이동 애니메이션
     * @param {Function} callback - 애니메이션 완료 후 실행할 콜백 함수
     */
    animateNavigation(callback) {
        if (!this.isAnimeAvailable) {
            callback();
            return;
        }

        // 페이지 페이드아웃 애니메이션
        anime({
            targets: '.content-container',
            opacity: 0,
            translateY: -20,
            duration: 600,
            easing: 'easeInOutQuad',
            complete: callback
        });
    }

    /**
     * 행 삭제 애니메이션
     * @param {HTMLElement} row - 삭제할 행 요소
     */
    animateRowRemoval(row) {
        if (!this.isAnimeAvailable || !row) {
            row.remove();
            return;
        }

        anime({
            targets: row,
            opacity: [1, 0],
            translateX: [0, 30],
            height: [row.offsetHeight, 0],
            marginTop: [parseFloat(getComputedStyle(row).marginTop) || 0, 0],
            marginBottom: [parseFloat(getComputedStyle(row).marginBottom) || 0, 0],
            duration: 400,
            easing: 'easeOutQuad',
            complete: () => {
                row.remove();
            }
        });
    }
}

// 애플리케이션 초기화 및 시작
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('단어장 수정 페이지 초기화 중...');

        // 앱 인스턴스 생성 및 초기화
        const app = new WordBookEditApp();

        // 전역 함수 설정 (HTML의 onclick 속성에서 호출하기 위함)
        window.addWordRow = function() {
            return app.addWordRow();
        };

        window.removeWordRow = function(button) {
            app.removeWordRow(button);
        };

        // 앱 인스턴스 전역 노출 (디버깅 및 개발 편의성)
        window.app = app;

        // 앱 초기화
        app.initialize().then(() => {
            console.log('단어장 수정 페이지 초기화 완료');
        }).catch(error => {
            console.error('단어장 수정 페이지 초기화 오류:', error);
        });
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