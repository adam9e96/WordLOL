/**
 * ui-utils.js
 * UI 관련 유틸리티 함수 모음
 */

class UiUtils {
    constructor() {
        this.setupEventListeners();
        this.initializeUIComponents();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeToasts();
            this.initializeModals();
            this.setupAuthListeners();
        });
    }

    /**
     * UI 컴포넌트 초기화
     */
    initializeUIComponents() {
        // 로딩 스피너 관련 함수
        window.showLoading = (show = true) => {
            const loadingSpinner = document.getElementById('loadingSpinner');
            if (loadingSpinner) {
                // 호출 스택 트레이스 추가
                console.trace(`로딩 스피너 상태 변경: ${show}`);

                // 명시적으로 display 스타일 설정
                loadingSpinner.style.display = show ? 'flex !important' : 'none !important';

                // 강제로 visibility와 opacity 조정
                if (show) {
                    loadingSpinner.style.visibility = 'visible';
                    loadingSpinner.style.opacity = '1';
                } else {
                    loadingSpinner.style.visibility = 'hidden';
                    loadingSpinner.style.opacity = '0';
                }
            }
        };


        // 토스트 알림 관련 함수
        window.showToast = (message, title = '알림', type = 'info') => {
            const toast = document.getElementById('authToast');
            if (!toast) return;

            const toastTitle = document.getElementById('toastTitle');
            const toastMessage = document.getElementById('toastMessage');
            const headerIcon = toast.querySelector('.toast-header i');

            // 아이콘 및 스타일 설정
            headerIcon.className = '';
            switch (type) {
                case 'success':
                    headerIcon.className = 'bi bi-check-circle-fill text-success me-2';
                    break;
                case 'error':
                    headerIcon.className = 'bi bi-exclamation-circle-fill text-danger me-2';
                    break;
                case 'warning':
                    headerIcon.className = 'bi bi-exclamation-triangle-fill text-warning me-2';
                    break;
                default:
                    headerIcon.className = 'bi bi-info-circle-fill text-info me-2';
            }

            toastTitle.textContent = title;
            toastMessage.textContent = message;

            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
        };

        // 인증 모달 표시 함수
        window.showAuthModal = () => {
            const authModal = document.getElementById('authModal');
            if (authModal) {
                const bsModal = new bootstrap.Modal(authModal);
                bsModal.show();
            }
        };
    }

    /**
     * 토스트 컴포넌트 초기화
     */
    initializeToasts() {
        // 부트스트랩 토스트 초기화
        const toastElList = [].slice.call(document.querySelectorAll('.toast'));
        toastElList.map(function (toastEl) {
            return new bootstrap.Toast(toastEl, {
                autohide: true,
                delay: 5000
            });
        });
    }

    /**
     * 모달 컴포넌트 초기화
     */
    initializeModals() {
        // 부트스트랩 모달 초기화 (필요 시)
        const authModal = document.getElementById('authModal');
        if (authModal) {
            // 로그인 버튼 이벤트 설정
            const loginButton = authModal.querySelector('.btn-primary');
            if (loginButton) {
                loginButton.addEventListener('click', () => {
                    if (window.AuthService) {
                        window.AuthService.handleGoogleLogin();
                    }
                });
            }
        }
    }

    /**
     * 인증 관련 이벤트 리스너 설정
     */
    setupAuthListeners() {
        // 인증 상태 변경 시 UI 업데이트
        document.addEventListener('auth-state-changed', (event) => {
            this.updateAuthUI(event.detail?.isAuthenticated);
        });

        // 사용자 정보 업데이트 시 UI 업데이트
        document.addEventListener('user-info-updated', (event) => {
            this.updateProfileUI(event.detail);
        });

        // 인증 필요 이벤트 처리
        document.addEventListener('auth-required', () => {
            window.showAuthModal();
        });

        // 로그인 버튼 이벤트 설정
        const loginButtons = document.querySelectorAll('.login-button');
        loginButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.AuthService) {
                    const redirectUri = e.currentTarget.dataset.redirectUri || window.location.pathname;
                    window.AuthService.handleGoogleLogin(redirectUri);
                }
            });
        });

        // 로그아웃 버튼 이벤트 설정
        const logoutButtons = document.querySelectorAll('.logout-link, .logout-button');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.AuthService) {
                    const redirectUri = e.currentTarget.dataset.redirectUri || '/';
                    window.AuthService.handleLogout(true, redirectUri);
                }
            });
        });

        // 초기 인증 상태 확인 및 UI 업데이트
        if (window.AuthService && window.AuthService.isAuthenticated()) {
            this.updateAuthUI(true);
        }
    }

    /**
     * 인증 상태에 따라 UI 업데이트
     */
    updateAuthUI(isAuthenticated) {
        const loggedOutView = document.getElementById('loggedOutView');
        const loggedInView = document.getElementById('loggedInView');
        const protectedElements = document.querySelectorAll('[data-require-auth="true"]');

        // 로그인/로그아웃 뷰 토글
        if (loggedOutView) {
            loggedOutView.style.display = isAuthenticated ? 'none' : 'block';
        }

        if (loggedInView) {
            loggedInView.style.display = isAuthenticated ? 'block' : 'none';
        }

        // 인증이 필요한 요소 처리
        protectedElements.forEach(element => {
            if (isAuthenticated) {
                element.classList.remove('auth-required');
                element.removeAttribute('disabled');
            } else {
                element.classList.add('auth-required');
                if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
                    element.setAttribute('disabled', 'disabled');
                }
            }
        });
    }

    /**
     * 사용자 프로필 UI 업데이트
     */
    updateProfileUI(userInfo) {
        if (!userInfo) return;

        const profileImage = document.getElementById('profileImage');
        const userName = document.getElementById('userName');

        // 프로필 이미지 업데이트
        if (profileImage && userInfo.picture) {
            profileImage.src = userInfo.picture;
            profileImage.alt = `${userInfo.name || '사용자'}의 프로필 이미지`;
        }

        // 사용자 이름 업데이트
        if (userName) {
            userName.textContent = userInfo.name || userInfo.email || '사용자';
        }
    }
}

// 싱글톤 인스턴스 생성
const uiUtils = new UiUtils();

// 전역으로 접근 가능하도록 설정
window.UiUtils = uiUtils;