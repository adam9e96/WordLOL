/**
 * 다중 단어 등록 애플리케이션 클래스
 */
class MultiWordRegistrationApp {

    constructor() {
        // API 기본 URL
        this.API_BASE_URL = '/api/v1/words/batch';

        // 처리 상태 플래그
        this.isProcessing = false;

        // 모듈 초기화
        this.validationManager = new ValidationManager();
        this.apiService = new ApiService(this.API_BASE_URL);
        this.formManager = new FormManager(this);
        this.animationManager = new AnimationManager();

        // DOM 요소 참조 캐싱
        this.elements = {
            form: document.getElementById('wordsForm'),
            wordRows: document.getElementById('wordRows'),
            addRowBtn: document.getElementById('addRowBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            saveBtn: document.getElementById('saveBtn'),
            rowTemplate: document.getElementById('wordRowTemplate'),
        };
    }

    /**
     * 애플리케이션 시작
     */
    initialize() {
        // 페이지 로드 시 기본 애니메이션 적용
        document.querySelector('.content-container').style.opacity = '1';
        document.querySelector('.content-container').style.transform = 'translateY(0)';
        document.querySelector('.content-container').style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 초기 행 3개 추가
        for (let i = 0; i < 3; i++) {
            this.addRow();
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 행 추가 버튼 클릭 이벤트
        this.elements.addRowBtn.addEventListener('click', () => this.addRow());

        // 폼 제출 이벤트
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // 취소 버튼 클릭 이벤트
        this.elements.cancelBtn.addEventListener('click', () => this.handleCancel());

        // 부트스트랩 유효성 검사 활성화
        this.setupBootstrapValidation();
    }

    /**
     * 부트스트랩 유효성 검사 설정 - 개선된 버전
     */
    setupBootstrapValidation() {
        // 실시간 유효성 검사를 위한 이벤트 위임
        this.elements.wordRows.addEventListener('input', (e) => {
            if (e.target.classList.contains('form-control') ||
                e.target.classList.contains('form-select')) {

                // 입력이 변경될 때마다 유효성 검사
                const isValid = e.target.checkValidity();

                // 입력 필드가 비어있지 않은 경우에만 유효성 상태 표시
                if (e.target.value.trim() !== '') {
                    if (isValid) {
                        e.target.classList.remove('is-invalid');
                    } else {
                        e.target.classList.add('is-invalid');
                    }
                } else {
                    // 필수 필드가 비어있는 경우
                    if (e.target.required) {
                        e.target.classList.add('is-invalid');
                    } else {
                        // 필수가 아닌 필드는 상태 제거
                        e.target.classList.remove('is-invalid');
                    }
                }
            }
        });

        // blur 이벤트에서 유효성 검사 수행 - 필드에서 포커스가 빠져나갈 때
        this.elements.wordRows.addEventListener('blur', (e) => {
            if (e.target.classList.contains('form-control') ||
                e.target.classList.contains('form-select')) {

                // 유효성 검사 다시 수행
                const isValid = e.target.checkValidity();

                // 필수 필드이고 비어있는 경우
                if (e.target.required && e.target.value.trim() === '') {
                    e.target.classList.add('is-invalid');
                }
                // 값이 있고 유효하지 않은 경우
                else if (e.target.value.trim() !== '' && !isValid) {
                    e.target.classList.add('is-invalid');
                }
                // 값이 있고 유효한 경우
                else if (e.target.value.trim() !== '' && isValid) {
                    e.target.classList.remove('is-invalid');
                }
            }
        }, true);
    }

    /**
     * 새 단어 행 추가
     */
    addRow() {
        // 템플릿에서 새 행 생성
        const clone = this.elements.rowTemplate.content.cloneNode(true);
        const newRow = clone.querySelector('.word-row');

        // 삭제 버튼 클릭 이벤트 리스너 추가
        const removeBtn = newRow.querySelector('.btn-remove');
        removeBtn.addEventListener('click', (e) => this.removeRow(e.currentTarget));

        // 행 추가
        this.elements.wordRows.appendChild(newRow);

        // 새 행 애니메이션
        setTimeout(() => {
            newRow.style.opacity = '1';
            newRow.style.transform = 'translateY(0)';
            newRow.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, 10);

        return newRow;
    }

    /**
     * 단어 행 제거
     * @param {HTMLElement} button - 클릭된 제거 버튼
     */
    removeRow(button) {
        const row = button.closest('.word-row');
        if (document.getElementsByClassName('word-row').length > 1) {
            // 행 제거 애니메이션
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

            setTimeout(() => {
                row.remove();
            }, 300);
        } else {
            window.showErrorToast('최소 1개의 행이 필요합니다.');

            // 오류 애니메이션
            row.style.transition = 'transform 0.1s ease';
            row.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                row.style.transform = 'translateX(10px)';
                setTimeout(() => {
                    row.style.transform = 'translateX(0)';
                }, 100);
            }, 100);
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
        if (!this.elements.form.checkValidity()) {
            e.stopPropagation();

            // 모든 필수 입력 필드에 대해 유효성 상태 강제 적용
            this.elements.form.querySelectorAll('input[required], select[required]').forEach(field => {
                if (!field.checkValidity()) {
                    field.classList.add('is-invalid');
                }
            });

            window.showErrorToast('모든 필수 항목을 올바르게 입력해주세요.');

            // 첫 번째 오류 입력 필드로 스크롤 및 포커스
            const firstInvalid = this.elements.form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({behavior: 'smooth', block: 'center'});
                setTimeout(() => {
                    firstInvalid.focus();
                }, 500);
            }

            return;
        }

        try {
            this.isProcessing = true;

            // 저장 버튼 비활성화
            this.elements.saveBtn.disabled = true;
            this.elements.saveBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> 저장 중...';

            // 폼 데이터 수집
            const wordsData = this.collectFormData();
            if (wordsData.length === 0) {
                throw new Error('유효한 단어 데이터가 없습니다.');
            }

            // 단어 등록 API 호출
            const result = await this.apiService.registerWords(wordsData);

            // 성공 알림 및 애니메이션
            window.showSuccessToast(`${result.count}개의 단어가 저장되었습니다.`);
            // 성공 애니메이션 및 리디렉션
            document.querySelector('.content-container').style.opacity = '0';
            document.querySelector('.content-container').style.transform = 'translateY(-20px)';

            setTimeout(() => {
                window.location.href = '/word/study';
            }, 1500);

        } catch (error) {
            console.error('Registration error:', error);
            window.showErrorToast(error.message || '저장 중 오류가 발생했습니다.');
            // 저장 버튼 복원
            this.elements.saveBtn.disabled = false;
            this.elements.saveBtn.innerHTML = '<i class="bi bi-save"></i> 단어 등록';
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 폼 데이터 수집 (원래 FormManager 클래스의 메소드를 여기로 이동)
     */
    collectFormData() {
        const rows = document.getElementsByClassName('word-row');
        const wordsData = [];

        for (let row of rows) {
            const vocabulary = row.querySelector('.vocabulary').value.trim();
            const meaning = row.querySelector('.meaning').value.trim();
            const hint = row.querySelector('.hint')?.value.trim() || '';
            const difficulty = row.querySelector('.difficulty').value;

            // 필수 필드가 비어있으면 건너뜀
            if (!vocabulary || !meaning || !difficulty) {
                continue;
            }

            wordsData.push({
                vocabulary: vocabulary,
                meaning: meaning,
                hint: hint,
                difficulty: parseInt(difficulty)
            });
        }

        return wordsData;
    }

    /**
     * 취소 버튼 처리
     */
    handleCancel() {
        history.back();
    }
}

/**
 * API 서비스 클래스
 */
class ApiService {
    /**
     * @param {string} baseUrl - API 기본 URL
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * 단어 일괄 등록 API 호출
     * @param {Array<Object>} wordsData - 등록할 단어 데이터 배열
     * @returns {Promise<Object>} - API 응답
     */
    async registerWords(wordsData) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(wordsData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || '단어 등록에 실패했습니다.');
        }

        return data;
    }
}

/**
 * 유효성 검사 관리 클래스
 */
class ValidationManager {
    constructor() {
        // 정규식 패턴
        this.PATTERNS = {
            vocabulary: /^[a-zA-Z\s\-]+$/,
            meaning: /^[가-힣a-zA-Z\s,\-\~]+$/
        };
    }

    /**
     * 영단어 유효성 검사
     * @param {string} value - 영단어
     * @returns {boolean} 유효성 여부
     */
    validateVocabulary(value) {
        value = value.trim();
        if (!value || value.length < 2 || value.length > 100) {
            return false;
        }
        return this.PATTERNS.vocabulary.test(value);
    }

    /**
     * 의미 유효성 검사
     * @param {string} value - 의미
     * @returns {boolean} 유효성 여부
     */
    validateMeaning(value) {
        value = value.trim();
        if (!value || value.length < 1 || value.length > 100) {
            return false;
        }
        return this.PATTERNS.meaning.test(value);
    }

    /**
     * 힌트 유효성 검사
     * @param {string} value - 힌트
     * @returns {boolean} 유효성 여부
     */
    validateHint(value) {
        return !value || value.length <= 100;
    }
}

/**
 * 폼 관리 클래스 (단순화)
 */
class FormManager {
    /**
     * @param {MultiWordRegistrationApp} app - 메인 앱 인스턴스
     */
    constructor(app) {
        this.app = app;
    }
}

/**
 * 애니메이션 관리 클래스 (단순화)
 */
class AnimationManager {
    constructor() {
        // 간단한 생성자
    }
}

// 애플리케이션 초기화 및 시작
document.addEventListener('DOMContentLoaded', function () {
    const app = new MultiWordRegistrationApp();
    app.initialize();
});