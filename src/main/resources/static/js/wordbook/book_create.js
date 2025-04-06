import {
    updateFieldStatus,
    validateDifficulty,
    validateHint,
    validateMeaning,
    validateVocabulary
} from "../utils/validation-service.js";
import apiService from '../utils/api-service.js';

// 전역 상태 변수
let isProcessing = false;

/**
 * 단어장 생성 페이지 초기화
 */
function initializeWordBookCreation() {
    addWordRows(2);

    // 이벤트 리스너 설정
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
}

async function handleSubmit(e) {
    e.preventDefault();

    // 중복 제출 방지
    if (isProcessing) return;
    isProcessing = true;

    try {
        // 폼 유효성 검사
        if (!validateForm()) {
            isProcessing = false;
            return;
        }

        // 데이터 수집
        const wordBookData = collectFormData();

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


function validateForm() {
    const form = document.getElementById('wordBookForm');

    // 기본 HTML5 유효성 검사
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        window.showErrorToast('필수 항목을 모두 입력해주세요.', {
            title: '입력 오류'
        });
        return false;
    }

    // 단어 목록 유효성 검사
    const wordRows = document.querySelectorAll('.word-row');
    if (wordRows.length === 0) {
        window.showErrorToast('최소 1개 이상의 단어가 필요합니다.', {
            title: '입력 오류'
        });
        return false;
    }

    // 각 단어 입력 필드 유효성 검사
    for (let i = 0; i < wordRows.length; i++) {
        const row = wordRows[i];
        const vocabulary = row.querySelector('.vocabulary').value.trim();
        const meaning = row.querySelector('.meaning').value.trim();
        const hint = row.querySelector('.hint').value.trim();
        const difficulty = row.querySelector('.difficulty').value;

        const validationResults = [
            {field: 'vocabulary', result: validateVocabulary(vocabulary)},
            {field: 'meaning', result: validateMeaning(meaning)},
            {field: 'hint', result: validateHint(hint)},
            {field: 'difficulty', result: validateDifficulty(difficulty)}
        ];

        // 유효하지 않은 필드 찾기
        const invalidField = validationResults.find(item => !item.result.isValid);

        if (invalidField) {
            // 유효하지 않은 필드가 있으면 해당 입력 필드에 표시하고 토스트 메시지 표시
            const fieldElement = row.querySelector(`.${invalidField.field}`);
            if (fieldElement) {
                updateFieldStatus(fieldElement, false, invalidField.result.message);
                fieldElement.focus();
            }

            window.showErrorToast(`${i + 1}번째 단어: ${invalidField.result.message}`, {
                title: '입력 오류'
            });

            // 해당 행이 뷰포트에 보이도록 스크롤
            row.scrollIntoView({behavior: 'smooth', block: 'center'});

            return false;
        }
    }

    return true;
}

/**
 * 폼 데이터 수집
 * @returns {Object} 수집된 단어장 데이터
 */
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

/**
 * 단어장 생성 API 호출
 * @param {Object} wordBookData - 단어장 데이터
 * @returns {Promise<Object>} API 응답 객체
 */
async function createWordBook(wordBookData) {
    return await apiService.createWordBook(wordBookData);

}

document.addEventListener('DOMContentLoaded', initializeWordBookCreation);