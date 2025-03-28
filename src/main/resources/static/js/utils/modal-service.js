class ModalService {
    constructor() {
        this.activeModals = new Map(); // 활성화된 모달 인스턴스 저장
        this.modalCounter = 0; // 모달 ID 생성용 카운터
        this.setupGlobalEvents();
    }

    /**
     * 전역 이벤트 설정
     * 모달 관련 이벤트 리스너 등록
     */
    setupGlobalEvents() {
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.size > 0) {
                // 가장 최근에 추가된 모달 닫기
                const lastModalId = Array.from(this.activeModals.keys()).pop();
                if (lastModalId) {
                    this.closeModal(lastModalId);
                }
            }
        });

        // 모달 열릴 때 body에 클래스 추가
        document.addEventListener('modal-opened', () => {
            document.body.classList.add('modal-open');
            document.body.setAttribute('data-modal-open', 'true');
        });

        // 모달이 모두 닫혔을 때 body에서 클래스 제거
        document.addEventListener('modal-closed', () => {
            if (this.activeModals.size === 0) {
                document.body.classList.remove('modal-open');
                document.body.removeAttribute('data-modal-open');
            }
        });
    }

    /**
     * 수정 모달 생성
     * @param {Object} word - 수정할 단어 객체
     * @param {Function} saveHandler - 저장 버튼 클릭 시 실행할 콜백 함수
     * @returns {string} 생성된 모달의 ID
     */
    createEditModal(word, saveHandler) {
        const modalId = `edit-modal-${this.modalCounter++}`;

        const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${modalId}-label">단어 수정</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="${modalId}-form">
                            <input id="${modalId}-id" type="hidden" value="${word.id || ''}">
                            <div class="form-group mb-3">
                                <label class="form-label" for="${modalId}-vocabulary">영단어</label>
                                <input class="form-control" id="${modalId}-vocabulary" required type="text" value="${word.vocabulary || ''}">
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="${modalId}-meaning">의미</label>
                                <input class="form-control" id="${modalId}-meaning" required type="text" value="${word.meaning || ''}">
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label" for="${modalId}-hint">힌트</label>
                                <input class="form-control" id="${modalId}-hint" type="text" value="${word.hint || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="${modalId}-difficulty">난이도</label>
                                <select class="form-select" id="${modalId}-difficulty" required>
                                    <option value="1" ${word.difficulty === 1 ? 'selected' : ''}>매우 쉬움</option>
                                    <option value="2" ${word.difficulty === 2 ? 'selected' : ''}>쉬움</option>
                                    <option value="3" ${word.difficulty === 3 ? 'selected' : ''}>보통</option>
                                    <option value="4" ${word.difficulty === 4 ? 'selected' : ''}>어려움</option>
                                    <option value="5" ${word.difficulty === 5 ? 'selected' : ''}>매우 어려움</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-modal-cancel" data-bs-dismiss="modal">취소</button>
                        <button type="button" class="btn btn-modal-save" id="${modalId}-save">저장</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        // 모달 DOM에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // 모달 인스턴스 생성
        const modalElement = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalElement);

        // 모달 이벤트 처리
        this.setupModalEvents(modalId, modalElement, modal);

        // 저장 버튼 이벤트 리스너 추가
        const saveButton = document.getElementById(`${modalId}-save`);
        saveButton.addEventListener('click', () => {
            const formData = this.getModalFormData(modalId);
            saveHandler(formData);
        });

        // 활성 모달 목록에 추가
        this.activeModals.set(modalId, { modal, element: modalElement });

        // 모달 표시
        modal.show();

        // 모달 ID 반환
        return modalId;
    }

    /**
     * 삭제 확인 모달 생성
     * @param {string|number} id - 삭제할 단어 ID
     * @param {Function} confirmHandler - 확인 버튼 클릭 시 실행할 콜백 함수
     * @returns {string} 생성된 모달의 ID
     */
    createDeleteConfirmModal(id, confirmHandler) {
        const modalId = `delete-modal-${this.modalCounter++}`;

        const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${modalId}-label">단어 삭제</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>정말로 이 단어를 삭제하시겠습니까?</p>
                        <p>이 작업은 되돌릴 수 없습니다.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-modal-cancel" data-bs-dismiss="modal">취소</button>
                        <button type="button" class="btn btn-error" id="${modalId}-confirm">삭제</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        // 모달 DOM에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // 모달 인스턴스 생성
        const modalElement = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalElement);

        // 모달 이벤트 처리
        this.setupModalEvents(modalId, modalElement, modal);

        // 확인 버튼 이벤트 리스너 추가
        const confirmButton = document.getElementById(`${modalId}-confirm`);
        confirmButton.addEventListener('click', () => {
            confirmHandler(id);
        });

        // 활성 모달 목록에 추가
        this.activeModals.set(modalId, { modal, element: modalElement });

        // 모달 표시
        modal.show();

        // 모달 ID 반환
        return modalId;
    }

    /**
     * 모달 이벤트 리스너 설정
     * @param {string} modalId - 모달 ID
     * @param {HTMLElement} modalElement - 모달 요소
     * @param {bootstrap.Modal} modal - 부트스트랩 모달 인스턴스
     */
    setupModalEvents(modalId, modalElement, modal) {
        // 모달이 열릴 때
        modalElement.addEventListener('shown.bs.modal', () => {
            document.dispatchEvent(new CustomEvent('modal-opened'));

            // 입력 필드가 있으면 첫 번째 필드에 포커스
            const firstInput = modalElement.querySelector('input:not([type="hidden"])');
            if (firstInput) {
                setTimeout(() => {
                    firstInput.focus();
                }, 100);
            }
        });

        // 모달이 닫힐 때
        modalElement.addEventListener('hidden.bs.modal', () => {
            this.cleanupModal(modalId);
            document.dispatchEvent(new CustomEvent('modal-closed'));
        });
    }

    /**
     * 모달 폼 데이터 가져오기
     * @param {string} modalId - 모달 ID
     * @returns {Object} 폼 데이터 객체
     */
    getModalFormData(modalId) {
        return {
            id: document.getElementById(`${modalId}-id`)?.value,
            vocabulary: document.getElementById(`${modalId}-vocabulary`)?.value.trim(),
            meaning: document.getElementById(`${modalId}-meaning`)?.value.trim(),
            hint: document.getElementById(`${modalId}-hint`)?.value.trim(),
            difficulty: parseInt(document.getElementById(`${modalId}-difficulty`)?.value || 3)
        };
    }

    /**
     * 모달 닫기
     * @param {string} modalId - 닫을 모달 ID
     */
    closeModal(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (modalData?.modal) {
            modalData.modal.hide();
        }
    }

    /**
     * 모달 정리 및 제거
     * @param {string} modalId - 정리할 모달 ID
     */
    cleanupModal(modalId) {
        // 활성 모달 목록에서 제거
        this.activeModals.delete(modalId);

        // 모달 요소 제거
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            modalElement.remove();
        }

        // 백드롭 요소들 제거
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.remove();
        });

        // 모달이 모두 닫혔으면 body 스타일 초기화
        if (this.activeModals.size === 0) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    }
    /**
     * 모든 활성 모달 닫기
     */
    closeAllModals() {
        // 모든 활성 모달을 순회하며 닫기
        this.activeModals.forEach((modalData, modalId) => {
            if (modalData.modal) {
                modalData.modal.hide();
            }
        });
    }
}

// 싱글톤 인스턴스 생성
const modalService = new ModalService();

// ES 모듈 내보내기
export default modalService;