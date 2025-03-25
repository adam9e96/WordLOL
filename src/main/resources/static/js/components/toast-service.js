/**
 * ToastUtils - 애니메이션을 적용한 토스트 메시지 유틸리티
 * 전역으로 사용 가능한 토스트 기능을 제공합니다.
 *
 * ex
 * // 성공 토스트
 * showSuccessToast('저장되었습니다.', { title: '저장 완료' });
 *
 * // 오류 토스트
 * showErrorToast('데이터를 불러오는 데 실패했습니다.');
 *
 * // 경고 토스트
 * showWarningToast('연결이 불안정합니다.', { duration: 5000 });
 *
 * // 정보 토스트
 * showInfoToast('새 버전이 출시되었습니다.');
 *
 * // 기존 방식도 계속 지원
 * showToast('작업이 완료되었습니다.', 'success');
 * showToast('오류가 발생했습니다.', 'error');
 */
class ToastUtils {
    /**
     * 생성자
     * @param {Object} [options={}] - 토스트 서비스 설정 옵션
     * @param {string} [options.containerId='toast-container'] - 토스트 컨테이너 ID
     * @param {number} [options.duration=3000] - 토스트 표시 지속 시간 (밀리초)
     * @param {boolean} [options.enableAnimation=true] - 애니메이션 활성화 여부
     * @param {number} [options.maxToasts=5] - 동시에 표시할 최대 토스트 개수
     */
    constructor(options = {}) {
        this.options = {
            containerId: options.containerId || 'toast-container',
            duration: options.duration || 3000,
            enableAnimation: options.enableAnimation !== false,
            maxToasts: options.maxToasts || 5
        };

        /** @type {HTMLElement|null} - 토스트 컨테이너 요소 */
        this.container = null;

        /** @type {boolean} - anime.js 라이브러리 사용 가능 여부 */
        this.animeAvailable = typeof anime !== 'undefined';

        /** @type {Array} - 현재 표시 중인 토스트 배열 */
        this.activeToasts = [];

        this.initialize();
    }

    /**
     * 토스트 서비스 초기화
     * 토스트 컨테이너를 생성하고 DOM 에 추가합니다.
     */
    initialize() {
        // 기존 컨테이너가 있는지 확인
        this.container = document.getElementById(this.options.containerId);

        // 없으면 새로 생성
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.options.containerId;
            this.container.className = 'toast-container position-fixed end-0 p-3';

            // 기본 스타일 설정
            Object.assign(this.container.style, {
                top: '1rem',
                right: '1rem',
                zIndex: '9999',
                maxWidth: '350px'
            });

            document.body.appendChild(this.container);
        }
    }

    /**
     * 토스트 메시지 표시
     * @param {string} message - 표시할 메시지
     * @param {string} [type='info'] - 토스트 유형 ('success', 'error', 'warning', 'info')
     * @param {Object} [options={}] - 추가 옵션
     * @param {string} [options.title] - 토스트 제목 (기본값: 유형에 따른 기본 제목)
     * @param {number} [options.duration] - 특정 토스트의 지속 시간 (밀리초)
     * @param {boolean} [options.dismissible=true] - 토스트를 닫을 수 있는지 여부
     * @returns {HTMLElement} 생성된 토스트 요소
     */
    show(message, type = 'info', options = {}) {
        // 유형 유효성 검사
        const validTypes = ['success', 'error', 'warning', 'info'];
        if (!validTypes.includes(type)) {
            type = 'info'; // 유효하지 않은 유형은 'info'로 기본 설정
        }

        // 각 유형별 설정
        const typeConfig = {
            success: {
                title: '성공',
                icon: 'bi-check-circle-fill',
                bgClass: 'bg-success'
            },
            error: {
                title: '오류',
                icon: 'bi-exclamation-circle-fill',
                bgClass: 'bg-danger'
            },
            warning: {
                title: '경고',
                icon: 'bi-exclamation-triangle-fill',
                bgClass: 'bg-warning'
            },
            info: {
                title: '알림',
                icon: 'bi-info-circle-fill',
                bgClass: 'bg-info'
            }
        };

        const config = typeConfig[type];
        const title = options.title || config.title;
        const duration = options.duration || this.options.duration;
        const dismissible = options.dismissible !== false;

        // 최대 토스트 개수 제한 관리
        this.manageToastLimit();

        // 토스트 요소 생성
        const toast = document.createElement('div');
        toast.className = `toast ${config.bgClass} text-white`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        // 텍스트 색상 조정 (특히 warning과 info의 경우)
        const textColorClass = (type === 'warning' || type === 'info') ? 'text-dark' : 'text-white';

        // 토스트 내용 설정
        toast.innerHTML = `
            <div class="toast-header ${config.bgClass} ${textColorClass}">
                <i class="bi ${config.icon} me-2"></i>
                <strong class="me-auto">${title}</strong>
                ${dismissible ? `
                <button type="button" class="btn-close ${type === 'warning' || type === 'info' ? '' : 'btn-close-white'}" 
                        data-bs-dismiss="toast" aria-label="Close"></button>
                ` : ''}
            </div>
            <div class="toast-body ${textColorClass}">
                ${message}
            </div>
        `;

        // 토스트를 컨테이너에 추가
        if (this.container) {
            this.container.appendChild(toast);
            this.activeToasts.push(toast);
        }

        // Bootstrap 토스트 인스턴스 생성 및 표시
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: duration
        });

        // 애니메이션 적용
        if (this.options.enableAnimation && this.animeAvailable) {
            this.animateToast(toast);
        } else {
            // 기본 CSS 애니메이션 클래스 추가
            toast.classList.add('toast-fallback-animation');

            // 숨겨질 때 애니메이션 처리
            toast.addEventListener('hide.bs.toast', () => {
                toast.classList.remove('toast-fallback-animation');
                toast.classList.add('toast-fallback-animation-hide');
            });
        }

        // 토스트 표시
        bsToast.show();

        // 숨겨진 후 제거 처리
        toast.addEventListener('hidden.bs.toast', () => {
            const index = this.activeToasts.indexOf(toast);
            if (index > -1) {
                this.activeToasts.splice(index, 1);
            }
            toast.remove();
        });

        return toast;
    }

    /**
     * 최대 토스트 개수 제한 관리
     * 최대 개수를 초과하는 경우 가장 오래된 토스트를 제거
     */
    manageToastLimit() {
        if (this.activeToasts.length >= this.options.maxToasts) {
            const oldestToast = this.activeToasts[0];
            if (oldestToast) {
                const bsToast = bootstrap.Toast.getInstance(oldestToast);
                if (bsToast) {
                    bsToast.hide();
                }
            }
        }
    }

    /**
     * 토스트에 애니메이션 적용
     * @param {HTMLElement} toast - 애니메이션을 적용할 토스트 요소
     */
    animateToast(toast) {
        // 초기 상태 설정
        anime.set(toast, {
            opacity: 0,
            translateX: 50
        });

        // 나타나는 애니메이션
        anime({
            targets: toast,
            opacity: 1,
            translateX: 0,
            duration: 400,
            easing: 'easeOutCubic'
        });

        // 사라지는 애니메이션 (토스트가 숨겨지기 전)
        toast.addEventListener('hide.bs.toast', () => {
            anime({
                targets: toast,
                opacity: 0,
                translateX: 50,
                duration: 300,
                easing: 'easeInCubic'
            });
        });
    }

    /**
     * 성공 토스트 표시 (편의 메소드)
     * @param {string} message - 표시할 메시지
     * @param {Object} [options={}] - 추가 옵션
     * @returns {HTMLElement} 생성된 토스트 요소
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * 오류 토스트 표시 (편의 메소드)
     * @param {string} message - 표시할 메시지
     * @param {Object} [options={}] - 추가 옵션
     * @returns {HTMLElement} 생성된 토스트 요소
     */
    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    /**
     * 경고 토스트 표시 (편의 메소드)
     * @param {string} message - 표시할 메시지
     * @param {Object} [options={}] - 추가 옵션
     * @returns {HTMLElement} 생성된 토스트 요소
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    /**
     * 정보 토스트 표시 (편의 메소드)
     * @param {string} message - 표시할 메시지
     * @param {Object} [options={}] - 추가 옵션
     * @returns {HTMLElement} 생성된 토스트 요소
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * 모든 활성 토스트 제거
     */
    clearAll() {
        [...this.activeToasts].forEach(toast => {
            const bsToast = bootstrap.Toast.getInstance(toast);
            if (bsToast) {
                bsToast.hide();
            }
        });
    }
}

// 전역 인스턴스 생성 및 window 객체에 등록
/**
 * 전역 토스트 유틸리티 인스턴스
 * @type {ToastUtils}
 */
window.ToastUtils = new ToastUtils({
    duration: 3000,
    containerId: 'app-toast-container',
    enableAnimation: true,
    maxToasts: 5
});

/**
 * 편의를 위한 전역 토스트 표시 함수
 * @param {string} message - 표시할 메시지
 * @param {string} [type='info'] - 토스트 유형 ('success', 'error', 'warning', 'info')
 * @param {Object} [options={}] - 추가 옵션
 * @returns {HTMLElement} 생성된 토스트 요소
 */
window.showToast = (message, type = 'info', options = {}) => {
    // 이전 버전 호환성 유지를 위한 처리
    if (typeof type === 'boolean') {
        type = type ? 'success' : 'error';
    }
    return window.ToastUtils.show(message, type, options);
};

// 각 유형별 편의 함수 제공
window.showSuccessToast = (message, options = {}) => window.ToastUtils.success(message, options);
window.showErrorToast = (message, options = {}) => window.ToastUtils.error(message, options);
window.showWarningToast = (message, options = {}) => window.ToastUtils.warning(message, options);
window.showInfoToast = (message, options = {}) => window.ToastUtils.info(message, options);