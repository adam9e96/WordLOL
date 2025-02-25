// 상태 관리
const State = {
    API_BASE_URL: '/api/v1/words',
    isProcessing: false
};

// DOM 요소 캐싱
const Elements = {
    form: document.getElementById('wordForm'),
    toast: document.getElementById('toast'),
    inputs: {
        vocabulary: document.getElementById('vocabulary'),
        meaning: document.getElementById('meaning'),
        hint: document.getElementById('hint'),
        getDifficulty() {
            return document.querySelector('input[name="difficulty"]:checked');
        }
    },
    buttons: {
        cancel: document.getElementById('cancelBtn'),
        submit: document.querySelector('button[type="submit"]')
    },
    feedback: {
        vocabulary: document.querySelector('#vocabulary + .invalid-feedback'),
        meaning: document.querySelector('#meaning + .invalid-feedback'),
        hint: document.querySelector('#hint + .invalid-feedback')
    }
};

// 유효성 검사 관리
const ValidationManager = {
    // 에러 메시지 상수
    ERROR_MESSAGES: {
        vocabulary: {
            required: '영단어를 입력해주세요.',
            pattern: '영단어는 영문자, 공백, 하이픈만 사용할 수 있습니다.',
            length: '영단어는 2자 이상 100자 이하로 입력해주세요.',
            duplicate: '이미 등록된 단어입니다.'
        },
        meaning: {
            required: '뜻을 입력해주세요.',
            length: '뜻은 1자 이상 100자 이하로 입력해주세요.',
            pattern: '뜻은 한글, 영문, 공백, 쉼표만 사용할 수 있습니다.'
        },
        hint: {
            length: '힌트는 100자 이하로 입력해주세요.'
        }
    },

    // 정규식 패턴
    PATTERNS: {
        vocabulary: /^[a-zA-Z\s\-]+$/,
        meaning: /^[가-힣a-zA-Z\s,\-\~]+$/  // ~ 문자 추가
    },

    // 중복 검사
    async checkDuplicate(vocabulary) {
        try {
            const response = await fetch(`${State.API_BASE_URL}/check-duplicate?vocabulary=${encodeURIComponent(vocabulary)}`);
            if (!response.ok) throw new Error('중복 검사 중 오류가 발생했습니다.');
            return response.json();
        } catch (error) {
            console.error('Duplicate check error:', error);
            throw error;
        }
    },

    // 필드별 검증
    validateVocabulary(value) {
        value = value.trim();
        if (!value) {
            return {isValid: false, message: this.ERROR_MESSAGES.vocabulary.required};
        }
        if (!this.PATTERNS.vocabulary.test(value)) {
            return {isValid: false, message: this.ERROR_MESSAGES.vocabulary.pattern};
        }
        if (value.length < 2 || value.length > 100) {
            return {isValid: false, message: this.ERROR_MESSAGES.vocabulary.length};
        }
        return {isValid: true};
    },

    validateMeaning(value) {
        value = value.trim();
        if (!value) {
            return {isValid: false, message: this.ERROR_MESSAGES.meaning.required};
        }
        if (!this.PATTERNS.meaning.test(value)) {
            return {isValid: false, message: this.ERROR_MESSAGES.meaning.pattern};
        }
        if (value.length < 1 || value.length > 100) {
            return {isValid: false, message: this.ERROR_MESSAGES.meaning.length};
        }
        return {isValid: true};
    },

    validateHint(value) {
        if (value && value.length > 100) {
            return {isValid: false, message: this.ERROR_MESSAGES.hint.length};
        }
        return {isValid: true};
    }
};

// UI 관리
const UIManager = {
    bsToast: new bootstrap.Toast(Elements.toast),

    showToast(message, type = 'success') {
        Elements.toast.classList.remove('bg-success', 'bg-danger');
        Elements.toast.classList.add(`bg-${type}`);
        Elements.toast.querySelector('.toast-body').textContent = message;
        this.bsToast.show();
    },

    updateFieldStatus(element, isValid, message = '') {
        element.classList.toggle('is-valid', isValid);
        element.classList.toggle('is-invalid', !isValid);

        const feedback = element.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    },

    setupValidation() {
        // 실시간 입력 검증
        Elements.inputs.vocabulary.addEventListener('input', () => {
            const result = ValidationManager.validateVocabulary(Elements.inputs.vocabulary.value);
            this.updateFieldStatus(Elements.inputs.vocabulary, result.isValid, result.message);
        });

        Elements.inputs.meaning.addEventListener('input', () => {
            const result = ValidationManager.validateMeaning(Elements.inputs.meaning.value);
            this.updateFieldStatus(Elements.inputs.meaning, result.isValid, result.message);
        });

        Elements.inputs.hint.addEventListener('input', () => {
            const result = ValidationManager.validateHint(Elements.inputs.hint.value);
            this.updateFieldStatus(Elements.inputs.hint, result.isValid, result.message);
        });
    }
};

// API 서비스
const ApiService = {
    async registerWord(wordData) {
        const response = await fetch(State.API_BASE_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(wordData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.errors?.join('\n') || '단어 등록에 실패했습니다.');
        }

        return response.json();
    }
};

// 폼 관리
const FormManager = {
    getFormData() {
        return {
            vocabulary: Elements.inputs.vocabulary.value.trim(),
            meaning: Elements.inputs.meaning.value.trim(),
            hint: Elements.inputs.hint.value.trim(),
            difficulty: parseInt(Elements.inputs.getDifficulty()?.value || 3)
        };
    },

    async validateFormData(data) {
        const vocabularyValidation = ValidationManager.validateVocabulary(data.vocabulary);
        if (!vocabularyValidation.isValid) {
            UIManager.showToast(vocabularyValidation.message, 'danger');
            Elements.inputs.vocabulary.focus();
            return false;
        }

        const meaningValidation = ValidationManager.validateMeaning(data.meaning);
        if (!meaningValidation.isValid) {
            UIManager.showToast(meaningValidation.message, 'danger');
            Elements.inputs.meaning.focus();
            return false;
        }

        const hintValidation = ValidationManager.validateHint(data.hint);
        if (!hintValidation.isValid) {
            UIManager.showToast(hintValidation.message, 'danger');
            Elements.inputs.hint.focus();
            return false;
        }

        // 중복 검사
        try {
            const {exists} = await ValidationManager.checkDuplicate(data.vocabulary);
            if (exists) {
                UIManager.showToast(ValidationManager.ERROR_MESSAGES.vocabulary.duplicate, 'danger');
                Elements.inputs.vocabulary.focus();
                return false;
            }
        } catch (error) {
            UIManager.showToast(error.message, 'danger');
            return false;
        }

        return true;
    },

    resetForm() {
        Elements.form.reset();
        Elements.inputs.vocabulary.focus();
    }
};

// 이벤트 핸들러
const EventHandlers = {
    async handleSubmit(e) {
        e.preventDefault();
        if (State.isProcessing) return;

        const wordData = FormManager.getFormData();

        try {
            State.isProcessing = true;

            if (!await FormManager.validateFormData(wordData)) {
                return;
            }

            await ApiService.registerWord(wordData);
            UIManager.showToast('단어가 성공적으로 등록되었습니다.');

            // 성공 후 리디렉션
            setTimeout(() => {
                window.location.href = '/word/list';
            }, 1000);

        } catch (error) {
            console.error('Registration error:', error);
            UIManager.showToast(error.message, 'danger');
        } finally {
            State.isProcessing = false;
        }
    },

    handleCancel() {
        history.back();
    }
};

// 초기화
function initialize() {
    // 이벤트 리스너 설정
    Elements.form.addEventListener('submit', EventHandlers.handleSubmit);
    Elements.buttons.cancel.addEventListener('click', EventHandlers.handleCancel);

    // 실시간 유효성 검사 설정
    UIManager.setupValidation();
}

// 앱 시작
document.addEventListener('DOMContentLoaded', initialize);