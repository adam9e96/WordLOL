import {
    updateFieldStatus,
    validateDifficulty,
    validateHint,
    validateMeaning,
    validateVocabulary,
    validateWordBookName,
    validateWordBookDescription,
    validateWordBookCategory,
    validateWordBookForm
} from "../utils/validation-service.js";
import apiService from '../utils/api-service.js';

let isProcessing = false;

function initializeWordBookCreation() {
    addWordRows(2);

    setupEventListeners();

    // 첫 입력 필드에 포커스
    document.getElementById('name').focus();
}

function setupEventListeners() {
    // 폼 제출 이벤트
    const form = document.getElementById('wordBookForm');
    form.addEventListener('submit', handleSubmit);

    // 단어 행 추가 버튼
    const addRowBtn = document.getElementById('addWordBtn');
    addRowBtn.addEventListener('click', addWordRow);

    // 취소 버튼
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', () => history.back());

    // 다중 행 추가 버튼들
    const bulkButtons = document.querySelectorAll('.bulk-actions button');
    bulkButtons.forEach(button => {
        button.addEventListener('click', () => {
            const rows = parseInt(button.dataset.rows || 0);
            if (rows > 0) {
                addWordRows(rows);
            }
        });
    });

    // 기본 필드 유효성 검사 리스너 설정
    setupBasicFieldValidationListeners();
}

/**
 * 기본 필드 유효성 검사 리스너 설정
 */
function setupBasicFieldValidationListeners() {
    // 단어장 이름 검증
    const nameInput = document.getElementById('name');
    // 수동으로 feedback 요소 추가 (없는 경우)
    ensureFeedbackElements(
        nameInput,
        '단어장 이름을 입력해주세요.',
        '올바른 단어장 이름입니다.'
    );

    nameInput.addEventListener('blur', (e) => {
        const result = validateWordBookName(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });
    nameInput.addEventListener('input', (e) => {
        if (e.target.value.trim() === '') {
            updateFieldStatus(e.target, null);
            return;
        }
        const result = validateWordBookName(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });

    // 단어장 설명 검증
    const descriptionInput = document.getElementById('description');
    // 수동으로 feedback 요소 추가 (없는 경우)
    ensureFeedbackElements(
        descriptionInput,
        '단어장 설명을 입력해주세요.',
        '올바른 설명입니다.'
    );

    descriptionInput.addEventListener('blur', (e) => {
        const result = validateWordBookDescription(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });
    descriptionInput.addEventListener('input', (e) => {
        if (e.target.value.trim() === '') {
            updateFieldStatus(e.target, null);
            return;
        }
        const result = validateWordBookDescription(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });

    // 카테고리 검증
    const categorySelect = document.getElementById('category');
    // 수동으로 feedback 요소 추가 (없는 경우)
    ensureFeedbackElements(
        categorySelect,
        '카테고리를 선택해주세요.',
        '올바른 카테고리입니다.'
    );

    categorySelect.addEventListener('change', (e) => {
        const result = validateWordBookCategory(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });

    // 초기 상태에서도 카테고리가 비어있으면 검증
    if (categorySelect.value.trim() === '') {
        const result = validateWordBookCategory(categorySelect.value);
        updateFieldStatus(categorySelect, result.isValid, result.message);
    }
}

/**
 * 입력 필드에 invalid-feedback 및 valid-feedback 요소가 없는 경우 추가
 * @param {HTMLElement} element - 입력 필드
 * @param {string} invalidMessage - 기본 오류 메시지
 * @param {string} validMessage - 기본 유효 메시지
 */
function ensureFeedbackElements(element, invalidMessage, validMessage) {
    if (!element) return;

    const formGroup = element.closest('.form-group');
    if (!formGroup) return;

    // 이미 invalid-feedback 요소가 있는지 확인
    let invalidFeedback = formGroup.querySelector('.invalid-feedback');

    // 없으면 새로 생성
    if (!invalidFeedback) {
        invalidFeedback = document.createElement('div');
        invalidFeedback.className = 'invalid-feedback';
        invalidFeedback.innerHTML = `<i class="bi bi-exclamation-triangle"></i> <span>${invalidMessage}</span>`;

        // 입력 필드 다음에 삽입
        element.insertAdjacentElement('afterend', invalidFeedback);
    }

    // 이미 valid-feedback 요소가 있는지 확인
    let validFeedback = formGroup.querySelector('.valid-feedback');

    // 없으면 새로 생성
    if (!validFeedback) {
        validFeedback = document.createElement('div');
        validFeedback.className = 'valid-feedback';
        validFeedback.innerHTML = `<i class="bi bi-check-circle"></i> <span>${validMessage}</span>`;

        // invalid-feedback 다음에 삽입
        invalidFeedback.insertAdjacentElement('afterend', validFeedback);
    }
}

function addWordRow() {
    // 템플릿에서 행 요소 복제
    const template = document.getElementById('wordRowTemplate');
    const row = document.importNode(template.content, true).querySelector('.word-row');

    // 삭제 버튼에 이벤트 리스너 추가
    const removeBtn = row.querySelector('.btn-remove');
    removeBtn.addEventListener('click', () => removeRow(removeBtn));

    // 실시간 유효성 검사 리스너 설정
    setupRowValidationListeners(row);

    // 단어 목록에 행 추가
    const wordList = document.getElementById('wordList');
    wordList.appendChild(row);

    return row;
}


function addWordRows(count) {
    for (let i = 0; i < count; i++) {
        addWordRow();
    }
}

function removeRow(element) {
    const row = element.closest('.word-row');
    const wordList = document.getElementById('wordList');
    const totalRows = wordList.querySelectorAll('.word-row').length;

    if (totalRows > 1) {
        // 삭제 애니메이션 적용
        row.classList.add('removing');

        // 애니메이션 완료 후 실제 삭제
        setTimeout(() => {
            row.remove();
        }, 200);
    } else {
        window.showErrorToast('최소 1개의 단어가 필요합니다.');
    }
}

/**
 * 단어 행 유효성 검사 리스너 설정
 * @param {HTMLElement} row - 단어 행 요소
 */
function setupRowValidationListeners(row) {
    // 영단어 입력 필드 유효성 검사
    const vocabularyInput = row.querySelector('.vocabulary');
    ensureFeedbackElements(
        vocabularyInput,
        '올바른 영단어를 입력해주세요.',
        '올바른 영단어입니다.'
    );

    vocabularyInput.addEventListener('blur', (e) => {
        const result = validateVocabulary(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });

    vocabularyInput.addEventListener('input', (e) => {
        if (e.target.value.trim() === '') {
            updateFieldStatus(e.target, null);
            return;
        }
        const result = validateVocabulary(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });

    // 의미 입력 필드 유효성 검사
    const meaningInput = row.querySelector('.meaning');
    ensureFeedbackElements(
        meaningInput,
        '의미를 입력해주세요.',
        '올바른 의미입니다.'
    );

    meaningInput.addEventListener('blur', (e) => {
        const result = validateMeaning(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });

    meaningInput.addEventListener('input', (e) => {
        if (e.target.value.trim() === '') {
            updateFieldStatus(e.target, null);
            return;
        }
        const result = validateMeaning(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });

    // 힌트 입력 필드 유효성 검사
    const hintInput = row.querySelector('.hint');
    ensureFeedbackElements(
        hintInput,
        '힌트는 100자 이내여야 합니다.',
        '올바른 힌트입니다.'
    );

    hintInput.addEventListener('blur', (e) => {
        const result = validateHint(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });

    hintInput.addEventListener('input', (e) => {
        if (e.target.value.trim() === '') {
            updateFieldStatus(e.target, null);
            return;
        }
        const result = validateHint(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });

    // 난이도 선택 필드 유효성 검사
    const difficultySelect = row.querySelector('.difficulty');
    ensureFeedbackElements(
        difficultySelect,
        '난이도를 선택해주세요.',
        '올바른 난이도입니다.'
    );

    difficultySelect.addEventListener('change', (e) => {
        const result = validateDifficulty(e.target.value);
        updateFieldStatus(e.target, result.isValid, result.message);
    });
}

async function handleSubmit(e) {
    e.preventDefault();

    // 중복 제출 방지
    if (isProcessing) return;
    isProcessing = true;

    try {
        // 데이터 수집
        const wordBookData = collectFormData();

        // 폼 입력 필드 유효성 검사 (UI에도 오류 표시)
        const nameField = document.getElementById('name');
        const descriptionField = document.getElementById('description');
        const categoryField = document.getElementById('category');

        const nameResult = validateWordBookName(nameField.value);
        const descriptionResult = validateWordBookDescription(descriptionField.value);
        const categoryResult = validateWordBookCategory(categoryField.value);

        // 유효성 검사 결과를 UI에 반영
        updateFieldStatus(nameField, nameResult.isValid, nameResult.message);
        updateFieldStatus(descriptionField, descriptionResult.isValid, descriptionResult.message);
        updateFieldStatus(categoryField, categoryResult.isValid, categoryResult.message);

        // 기본 필드 유효성 검사 실패 시 처리
        if (!nameResult.isValid) {
            nameField.focus();
            window.showErrorToast(nameResult.message, {title: '입력 오류'});
            isProcessing = false;
            return;
        }

        if (!descriptionResult.isValid) {
            descriptionField.focus();
            window.showErrorToast(descriptionResult.message, {title: '입력 오류'});
            isProcessing = false;
            return;
        }

        if (!categoryResult.isValid) {
            categoryField.focus();
            window.showErrorToast(categoryResult.message, {title: '입력 오류'});
            isProcessing = false;
            return;
        }

        // 개선된 단어장 유효성 검사 사용 (단어 목록 검사)
        const isValid = await validateWordBookForm(wordBookData, {
            showToast: true,
            focusField: (index) => {
                // 해당 인덱스의 단어 행으로 포커스
                const wordRows = document.querySelectorAll('.word-row');
                if (wordRows[index]) {
                    const vocabularyField = wordRows[index].querySelector('.vocabulary');
                    if (vocabularyField) {
                        vocabularyField.focus();
                    }
                    // 화면에 보이도록 스크롤
                    wordRows[index].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        });

        if (!isValid) {
            isProcessing = false;
            return;
        }

        // 단어장 생성 API 호출
        await createWordBook(wordBookData);

        // 성공 메시지 및 리디렉션
        window.showSuccessToast('단어장이 성공적으로 생성되었습니다.', {
            title: '생성 완료'
        });

        // 목록 페이지로 리디렉션
        setTimeout(() => {
            window.location.href = '/wordbook/list';
        }, 1500);
    } catch (error) {
        console.error('단어장 생성 오류:', error);
        window.showErrorToast(error.message || '단어장 생성 중 오류가 발생했습니다.', {
            title: '생성 실패'
        });
    } finally {
        isProcessing = false;
    }
}

function collectFormData() {
    // 단어 목록 데이터 수집
    const wordRows = document.querySelectorAll('.word-row');
    const words = Array.from(wordRows).map(row => ({
        vocabulary: row.querySelector('.vocabulary').value.trim(),
        meaning: row.querySelector('.meaning').value.trim(),
        hint: row.querySelector('.hint').value.trim() || null,
        difficulty: parseInt(row.querySelector('.difficulty').value)
    }));

    // 단어장 기본 정보
    return {
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value,
        words: words
    };
}

async function createWordBook(wordBookData) {
    return await apiService.createWordBook(wordBookData);

}

document.addEventListener('DOMContentLoaded', initializeWordBookCreation);