import {
    validateVocabulary,
    validateMeaning,
    validateHint,
    validateDifficulty,
    validateWordForm,
    updateFieldStatus
} from "../utils/validation.js";
import apiService from '../utils/api-service.js';

class WordRegistrationApp {
    constructor() {
        this.isProcessing = false;

        this.elements = {
            form: document.getElementById('wordForm'),
            vocabulary: document.getElementById('vocabulary'),
            meaning: document.getElementById('meaning'),
            hint: document.getElementById('hint'),
            difficultyOptions: document.querySelectorAll('input[name="difficulty"]'),
            submitBtn: document.querySelector('.btn-register-word')
        };
    }

    initialize() {
        // 첫 로딩 시 모든 피드백 메시지 숨기기
        this.hideAllFeedbackMessages();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 입력 필드에 초점 맞추기
        this.elements.vocabulary.focus();
    }

    // 모든 피드백 메시지 숨기기
    hideAllFeedbackMessages() {
        document.querySelectorAll('.invalid-feedback, .valid-feedback').forEach(el => {
            el.style.display = 'none';
        });
    }

    setupEventListeners() {
        // 단어 등록 폼 제출 이벤트
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // 취소 버튼 클릭 이벤트
        document.getElementById('cancelBtn').addEventListener('click', () => this.handleCancel());

        // 실시간 유효성 검사
        this.setupValidationListeners();
    }

    /**
     * 실시간 유효성 검사 리스너 설정
     */
    setupValidationListeners() {
        // 영단어 입력 필드 유효성 검사
        this.elements.vocabulary.addEventListener('blur', (e) => {
            const result = validateVocabulary(e.target.value);
            updateFieldStatus(e.target, result.isValid, result.message);
        });
        this.elements.vocabulary.addEventListener('input', (e) => {
            const trimmedValue = e.target.value.trim();
            if (trimmedValue === '') {
                updateFieldStatus(e.target, null);
                return;
            }
            const result = validateVocabulary(e.target.value);
            updateFieldStatus(e.target, result.isValid, result.message);
        });
        // 의미 입력 필드 유효성 검사
        this.elements.meaning.addEventListener('blur', (e) => {
            const result = validateMeaning(e.target.value);
            updateFieldStatus(e.target, result.isValid, result.message);
        });
        this.elements.meaning.addEventListener('input', (e) => {
            const trimmedValue = e.target.value.trim();
            if (trimmedValue === '') {
                updateFieldStatus(e.target, null);
            }
            const result = validateMeaning(e.target.value);
            updateFieldStatus(e.target, result.isValid, result.message);
        });
        // 힌트 입력 필드 유효성 검사
        this.elements.hint.addEventListener('blur', (e) => {
            const result = validateHint(e.target.value);
            updateFieldStatus(e.target, result.isValid, result.message);
        });
        this.elements.hint.addEventListener('input', (e) => {
            const trimmedValue = e.target.value.trim();
            if (trimmedValue === '') {
                updateFieldStatus(e.target, null);
            }
            const result = validateHint(e.target.value);
            updateFieldStatus(e.target, result.isValid, result.message);
        });
        // 난이도 변경 시 유효성 검사
        this.elements.difficultyOptions.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const result = validateDifficulty(e.target.value);
                // 난이도는 라디오 버튼 그룹 전체가 컨테이너이므로 다르게 처리
                const difficultyContainer = e.target.closest('.difficulty-options');
                if (difficultyContainer) {
                    difficultyContainer.classList.toggle('is-invalid', !result.isValid);

                    const feedback = difficultyContainer.querySelector('.invalid-feedback');
                    if (feedback) {
                        feedback.textContent = result.message;
                        feedback.style.display = !result.isValid ? 'block' : 'none';
                    }
                }
            });
        });
    }

    /**
     * 폼 제출 처리
     * @param {Event} e - 제출 이벤트
     */
    async handleSubmit(e) {
        e.preventDefault();

        if (this.isProcessing) return;

        // 폼 데이터 수집
        const wordData = {
            vocabulary: this.elements.vocabulary.value.trim(),
            meaning: this.elements.meaning.value.trim(),
            hint: this.elements.hint.value.trim(),
            difficulty: parseInt(
                document.querySelector('input[name="difficulty"]:checked')?.value || 3
            )
        };

        try {
            this.isProcessing = true;

            // 전체 폼 유효성 검사 (중복 포함)
            const isValid = await validateWordForm(wordData, {
                showToast: true,
                checkDuplicate: async (vocabulary) => {
                    return await apiService.checkWordDuplicate(vocabulary);
                }
            });

            // 유효성 검사 실패 시 처리
            if (!isValid) {
                this.isProcessing = false;
                return;
            }
            // 단어 등록 API 호출
            await apiService.registerWord(wordData);

            // 성공 알림 및 애니메이션
            window.showSuccessToast('단어가 성공적으로 등록되었습니다.', {title: '등록 완료'});

            // 성공 후 리디렉션
            setTimeout(() => {
                window.location.href = '/word/list';
            }, 1500);

        } catch (error) {
            console.error('Registration error:', error);
            // 에러 토스트 메시지 표시
            window.showErrorToast(error.message || '단어 등록에 실패했습니다.', {
                title: '등록 실패'
            });

            this.isProcessing = false;
        }
    }

    handleCancel() {
        history.back();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const app = new WordRegistrationApp();
    app.initialize();
});