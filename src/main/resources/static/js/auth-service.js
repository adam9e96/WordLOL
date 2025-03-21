/**
 * @class AuthService
 * @description 애플리케이션의 인증 관련 기능을 담당하는 서비스 클래스
 */
class AuthService {
    /**
     * 인증 관련 API 엔드포인트 정의
     * @static
     * @readonly
     *
     * @property {string} AUTH_ME - 사용자 정보를 가져오는 API 엔드포인트
     * @property {string} AUTH_STATUS - 인증 상태 확인 API 엔드포인트
     * @property {string} LOGOUT - 로그아웃 API 엔드포인트
     * @property {string} OAUTH_LOGIN - 구글 OAuth 로그인 API 엔드포인트
     */
    static API_ENDPOINTS = {
        AUTH_ME: '/api/v1/auth/me',
        AUTH_STATUS: '/api/v1/auth/status',
        LOGOUT: '/api/v1/auth/logout',
        OAUTH_LOGIN: '/oauth2/authorization/google'
    };

    constructor() {
        this.initializeEventListeners();
        this.checkAuthStatus(); // 페이지 로드 시 인증 상태 확인
    }

    /**
     * 이벤트 리스너 초기화
     */
    initializeEventListeners() {
        // 페이지 포커스 얻을 때 인증 상태 확인
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkAuthStatus();
            }
        });
    }

    /**
     * 인증 상태 확인 메서드
     * 서버에 현재 인증 상태를 확인 요청
     */
    async checkAuthStatus() {
        try {
            const response = await fetch(AuthService.API_ENDPOINTS.AUTH_STATUS, {
                credentials: 'include' // 쿠키 포함
            });

            if (!response.ok) {
                this.notifyAuthStateChanged(false);
                return false;
            }

            const data = await response.json();
            const isAuthenticated = data.authenticated === true;

            this.notifyAuthStateChanged(isAuthenticated);

            if (isAuthenticated && data.userInfo) {
                this.notifyUserInfoUpdated(data.userInfo);
            }

            return isAuthenticated;
        } catch (error) {
            console.error('인증 상태 확인 중 오류:', error);
            this.notifyAuthStateChanged(false);
            return false;
        }
    }


    /**
     * 현재 사용자의 인증 상태를 확인합니다.
     * @returns {Promise<boolean>} 인증 여부 (true: 인증됨, false: 인증되지 않음)
     */
    async isAuthenticated() {
        return await this.checkAuthStatus();
    }

    /**
     * API 요청에 사용할 인증 관련 옵션을 반환합니다.
     * 세션 쿠키가 자동으로 전송되도록 credentials: 'include' 옵션을 포함합니다
     * @returns {{credentials: string}} 요청 옵션 객체
     */
    getRequestOptions() {
        return {
            credentials: 'include' // 쿠키 포함
        };
    }

    /**
     * 사용자 정보를 로드합니다.
     * @returns {Promise<Object|null>} 사용자 정보 객체 또는 null
     */
    async loadUserInfo() {
        try {
            const response = await fetch(AuthService.API_ENDPOINTS.AUTH_ME,
                this.getRequestOptions()); // getRequestOptions 메서드 사용

            if (!response.ok) {
                console.error('사용자 정보 로드 실패:', response.status);
                return null;
            }

            const userInfo = await response.json();
            this.notifyUserInfoUpdated(userInfo);
            return userInfo;
        } catch (error) {
            console.error('사용자 정보 로드 오류:', error);
            return null;
        }
    }

    /**
     * Google OAuth 로그인 프로세스를 시작합니다
     *
     * @description
     * 이 메서드는 Google OAuth 인증 흐름을 시작하는 역할을 합니다.
     * 로그인 완료 후 돌아올 경로를 서버에 전달하고, 사용자를 Google 로그인 페이지로 리다이렉트합니다.
     *
     * @param {string} [redirectUri] - 로그인 성공 후 리다이렉트할 앱 내 경로
     */
    handleGoogleLogin(redirectUri) {
        // 로그인 성공 후 리다이렉트할 URL 설정
        const loginUrl = new URL(AuthService.API_ENDPOINTS.OAUTH_LOGIN, window.location.origin);

        if (redirectUri) {
            // 세션 스토리지에 리다이렉트 경로 저장 (URL 파라미터 대신)
            sessionStorage.setItem('auth_redirect_uri', redirectUri);
        }

        // Google OAuth 로그인 페이지로 리다이렉트
        window.location.href = loginUrl.toString();
    }


    /**
     * 로그아웃 요청을 서버에 전송합니다.
     */
    async handleLogout(redirect = true, redirectUrl = '/') {
        try {
            await fetch(AuthService.API_ENDPOINTS.LOGOUT, {
                method: 'POST',
                credentials: 'include' // 쿠키 포함
            });

            this.notifyAuthStateChanged(false);

            if (redirect) {
                window.location.href = redirectUrl;
            }
        } catch (error) {
            console.error('로그아웃 중 오류:', error);
            this.notifyAuthStateChanged(false);

            if (redirect) {
                window.location.href = redirectUrl;
            }
        }
    }

    /**
     * 인증 상태 변경 이벤트 발생
     * @param {boolean} isAuthenticated - 인증 상태 (true: 인증됨, false: 인증되지 않음)
     */
    notifyAuthStateChanged(isAuthenticated) {
        const event = new CustomEvent('auth-state-changed', {
            detail: {isAuthenticated}
        });
        document.dispatchEvent(event);
    }

    /**
     * 사용자 정보 업데이트 이벤트 발생
     * @param {{ email: string, name: string, picture: string }} userInfo - 사용자 정보
     */
    notifyUserInfoUpdated(userInfo) {
        const event = new CustomEvent('user-info-updated', {
            detail: userInfo
        });
        document.dispatchEvent(event);
    }

    /**
     * 인증 필요 이벤트 발생
     * 사용자에게 로그인이 필요하다는 알림을 표시합니다.
     */
    notifyAuthRequired() {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('auth_redirect_uri', currentPath);

        const event = new CustomEvent('auth-required', {
            detail: {returnUrl: currentPath}
        });
        document.dispatchEvent(event);
    }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();
/**
 * 전역으로 접근 가능하도록 설정 (생성된 인스턴스를 window 객체의 속성으로 할당)
 * ex) window.AuthService.handleGoogleLogin();
 * @type {AuthService}
 */
window.AuthService = authService;