/**
 * auth-service.js
 * 인증 관련 기능을 중앙에서 관리하는 모듈 (리팩토링 버전)
 */

class AuthService {
    // 스토리지 키 상수
    static TOKEN_KEYS = {
        ACCESS_TOKEN: 'wordlol_access_token',
        REFRESH_TOKEN: 'wordlol_refresh_token',
        TOKEN_TYPE: 'wordlol_token_type',
        USER_INFO: 'wordlol_user_info'
    };

    // API 엔드포인트
    static API_ENDPOINTS = {
        AUTH_ME: '/api/v1/auth/me',
        REFRESH_TOKEN: '/api/v1/auth/refresh',
        OAUTH_LOGIN: '/oauth2/authorization/google'
    };

    constructor() {
        this.refreshTokenPromise = null;
        this.initializeEventListeners();

        // 로컬 스토리지에 토큰이 있는지 확인 후 초기화
        this.checkInitialAuth();
    }

    /**
     * 이벤트 리스너 초기화
     */
    initializeEventListeners() {
        // 다른 탭에서 스토리지 변경 시 처리
        window.addEventListener('storage', (event) => {
            if (Object.values(AuthService.TOKEN_KEYS).includes(event.key)) {
                console.log('토큰 스토리지 변경 감지:', event.key);

                const isAuthenticated = this.isAuthenticated();
                this.notifyAuthStateChanged(isAuthenticated);

                if (isAuthenticated) {
                    this.validateAndRefreshTokenIfNeeded();
                }
            }
        });

        // 페이지 포커스 얻을 때 인증 상태 확인
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isAuthenticated()) {
                this.validateAndRefreshTokenIfNeeded();
            }
        });
    }

    /**
     * 로컬 스토리지에서 초기 인증 상태 확인
     */
    checkInitialAuth() {
        if (this.isAuthenticated()) {
            console.log('기존 토큰 발견, 유효성 검사 중...');
            // 페이지 로드 시 토큰 유효성 확인
            this.validateAndRefreshTokenIfNeeded()
                .then(isValid => {
                    if (isValid) {
                        this.notifyAuthStateChanged(true);
                        this.loadUserInfo();
                    } else {
                        this.notifyAuthStateChanged(false);
                        this.handleLogout(true, '/login');
                    }
                })
                .catch(err => {
                    console.error('토큰 검증 오류:', err);
                    this.notifyAuthStateChanged(false);
                    this.handleLogout(true, '/login');
                });
        } else {
            // URL에서 토큰 파라미터 확인 (OAuth 리다이렉션)
            this.checkTokensFromUrl();
        }
    }

    checkAuthStatus() {
        console.group('인증 상태 확인');

        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();

        console.log('Access Token 존재 여부:', !!accessToken);
        console.log('Refresh Token 존재 여부:', !!refreshToken);

        if (accessToken) {
            const decodedToken = this.decodeToken(accessToken);
            console.log('디코딩된 토큰:', decodedToken);
        }

        const isAuthenticated = this.isAuthenticated();
        console.log('현재 인증 상태:', isAuthenticated);

        console.groupEnd();

        return isAuthenticated;
    }


    /**
     * URL에서 토큰 파라미터 확인 (OAuth 리다이렉션 후)
     */
    checkTokensFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');
        const tokenType = urlParams.get('tokenType') || 'Bearer';

        console.log('URL 토큰 파라미터:', {
            accessToken,
            refreshToken,
            tokenType
        });

        if (accessToken && refreshToken) {
            console.log('URL에서 토큰 발견, 저장 중...');

            // 토큰 저장
            this.saveTokens({
                accessToken,
                refreshToken,
                tokenType
            });

            // URL에서 토큰 파라미터 제거
            const url = new URL(window.location);
            url.searchParams.delete('accessToken');
            url.searchParams.delete('refreshToken');
            url.searchParams.delete('tokenType');
            window.history.replaceState({}, document.title, url);

            // 인증 상태 변경 알림
            this.notifyAuthStateChanged(true);

            // 사용자 정보 로드
            this.loadUserInfo();

            // 로그인 성공 알림
            if (window.showToast) {
                window.showToast('로그인이 완료되었습니다.', '인증 성공', 'success');
            }
        }
    }

    /**
     * 토큰 저장
     */
    // 토큰 저장 메서드 개선
    saveTokens(tokenData) {
        try {
            // 토큰 저장 시 더 안전하고 명시적인 검증 추가
            if (!tokenData.accessToken || !tokenData.refreshToken) {
                console.error('유효하지 않은 토큰 데이터:', tokenData);
                return false;
            }

            localStorage.setItem(AuthService.TOKEN_KEYS.ACCESS_TOKEN, tokenData.accessToken);
            localStorage.setItem(AuthService.TOKEN_KEYS.REFRESH_TOKEN, tokenData.refreshToken);
            localStorage.setItem(AuthService.TOKEN_KEYS.TOKEN_TYPE, tokenData.tokenType || 'Bearer');

            // 토큰 저장 후 즉시 검증
            this.validateStoredTokens();

            return true;
        } catch (error) {
            console.error('토큰 저장 오류:', error);
            return false;
        }
    }

    /**
     * 토큰 삭제 (로그아웃)
     */
    clearTokens() {
        Object.values(AuthService.TOKEN_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    /**
     * 액세스 토큰 가져오기
     */
    getAccessToken() {
        return localStorage.getItem(AuthService.TOKEN_KEYS.ACCESS_TOKEN);
    }

    /**
     * 리프레시 토큰 가져오기
     */
    getRefreshToken() {
        return localStorage.getItem(AuthService.TOKEN_KEYS.REFRESH_TOKEN);
    }

    /**
     * 토큰 타입 가져오기
     */
    getTokenType() {
        return localStorage.getItem(AuthService.TOKEN_KEYS.TOKEN_TYPE) || 'Bearer';
    }

    // 인증 헤더 생성 시 더 엄격한 검증
    getAuthHeader() {
        const token = this.getAccessToken();
        const tokenType = this.getTokenType();

        if (!token) {
            console.warn('인증 헤더 생성 실패: 토큰 없음');
            return null;
        }

        // 토큰 만료 확인
        if (this.isTokenExpired(token)) {
            console.log('토큰 만료, 갱신 필요');
            this.refreshToken();
            return null;
        }

        return {
            'Authorization': `${tokenType} ${token}`
        };
    }


    /**
     * 로그인 상태 확인
     */
    isAuthenticated() {
        return !!this.getAccessToken();
    }

    /**
     * JWT 토큰 디코딩
     */
    decodeToken(token) {
        try {
            if (!token) return null;

            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(window.atob(base64));

            console.log('디코딩된 토큰 페이로드:', {
                sub: decoded.sub,
                exp: new Date(decoded.exp * 1000).toISOString(),
                currentTime: new Date().toISOString()
            });

            return decoded;
        } catch (error) {
            console.error('토큰 디코딩 오류:', error);
            return null;
        }
    }

    isTokenExpired(token, bufferSeconds = 60) {
        try {
            const payload = this.decodeToken(token);
            if (!payload || !payload.exp) {
                console.warn('토큰 페이로드 검증 실패', {payload});
                return true;
            }

            const expiryTime = payload.exp * 1000;
            const currentTime = Date.now();
            const bufferTime = bufferSeconds * 1000;

            console.log('토큰 만료 검사 상세 정보:', {
                currentTime: new Date(currentTime).toISOString(),
                expiryTime: new Date(expiryTime).toISOString(),
                bufferTime: bufferTime + 'ms',
                tokenPayload: payload
            });

            const isExpired = (currentTime + bufferTime) > expiryTime;

            console.log('토큰 만료 상태:', isExpired);

            return isExpired;
        } catch (error) {
            console.error('토큰 만료 확인 중 오류:', error);
            return true;
        }
    }

    // 리프레시 토큰 메서드 개선
    async refreshToken() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            console.warn('리프레시 토큰 없음');
            this.clearTokens();
            this.notifyAuthRequired();
            return false;
        }

        try {
            const response = await fetch(AuthService.API_ENDPOINTS.REFRESH_TOKEN, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({refreshToken})
            });

            if (!response.ok) {
                throw new Error(`토큰 갱신 실패: ${response.status}`);
            }

            const tokenData = await response.json();
            const saved = this.saveTokens(tokenData);

            if (saved) {
                this.notifyAuthStateChanged(true);
                return true;
            } else {
                throw new Error('토큰 저장 실패');
            }
        } catch (error) {
            console.error('토큰 갱신 오류:', error);
            this.clearTokens();
            this.notifyAuthRequired();
            return false;
        }
    }

    /**
     * 토큰 유효성 확인 및 필요 시 갱신
     */
    async validateAndRefreshTokenIfNeeded() {
        if (!this.isAuthenticated()) {
            console.log('인증되지 않은 상태');
            return false;
        }

        const accessToken = this.getAccessToken();
        if (!accessToken) {
            console.log('액세스 토큰 없음');
            return false;
        }

        try {
            // 토큰 만료 확인
            const isExpired = this.isTokenExpired(accessToken);

            if (isExpired) {
                console.log('토큰 만료됨, 갱신 시도');
                return await this.refreshToken();
            }

            console.log('토큰 유효');
            return true;
        } catch (error) {
            console.error('토큰 유효성 검사 중 오류:', error);
            return false;
        }
    }

    /**
     * 사용자 정보 로드
     */
    async loadUserInfo() {
        if (!this.isAuthenticated()) {
            return null;
        }

        try {
            // 이미 캐시된 사용자 정보가 있는지 확인
            const cachedUserInfo = localStorage.getItem(AuthService.TOKEN_KEYS.USER_INFO);
            if (cachedUserInfo) {
                const userInfo = JSON.parse(cachedUserInfo);
                this.notifyUserInfoUpdated(userInfo);
                return userInfo;
            }

            // 토큰 유효성 확인
            const isValid = await this.validateAndRefreshTokenIfNeeded();
            if (!isValid) {
                return null;
            }

            // 사용자 정보 요청
            const response = await fetch(AuthService.API_ENDPOINTS.AUTH_ME, {
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error(`사용자 정보 로드 실패: ${response.status}`);
            }

            const email = await response.text();

            // 기본 사용자 정보 생성
            const userInfo = {
                email,
                name: email.split('@')[0],
                picture: '/images/default-profile.png'
            };

            // 사용자 정보 캐싱
            localStorage.setItem(AuthService.TOKEN_KEYS.USER_INFO, JSON.stringify(userInfo));

            // 사용자 정보 업데이트 이벤트 발생
            this.notifyUserInfoUpdated(userInfo);

            return userInfo;
        } catch (error) {
            console.error('사용자 정보 로드 오류:', error);
            return null;
        }
    }

    /**
     * 1. 로그인 시작 점
     * 구글 로그인 처리
     * @param redirectUri
     */
    handleGoogleLogin(redirectUri) {
        if (redirectUri) {
            localStorage.setItem('auth_redirect_uri', redirectUri);
        }

        // 로그인 페이지로 리다이렉트
        window.location.href = AuthService.API_ENDPOINTS.OAUTH_LOGIN;
    }

    /**
     * 로그아웃 처리
     */
    handleLogout(redirect = true, redirectUrl = '/') {
        this.clearTokens();
        this.notifyAuthStateChanged(false);

        if (redirect) {
            window.location.href = redirectUrl;
        }
    }

    /**
     * 인증 요청 래퍼 함수
     * 인증이 필요한 기능 실행 전 인증 상태 확인
     */
    requireAuth(callback) {
        if (!this.isAuthenticated()) {
            this.notifyAuthRequired();
            return false;
        }

        this.validateAndRefreshTokenIfNeeded()
            .then(isValid => {
                if (isValid) {
                    callback();
                } else {
                    this.notifyAuthRequired();
                }
            })
            .catch(error => {
                console.error('인증 확인 오류:', error);
                this.notifyAuthRequired();
            });

        return true;
    }

    /**
     * 인증 상태 변경 이벤트 발생
     */
    notifyAuthStateChanged(isAuthenticated) {
        const event = new CustomEvent('auth-state-changed', {
            detail: {isAuthenticated}
        });
        document.dispatchEvent(event);
    }

    /**
     * 사용자 정보 업데이트 이벤트 발생
     */
    notifyUserInfoUpdated(userInfo) {
        const event = new CustomEvent('user-info-updated', {
            detail: userInfo
        });
        document.dispatchEvent(event);
    }

    /**
     * 인증 필요 이벤트 발생
     */
    notifyAuthRequired() {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('auth_redirect_uri', currentPath);

        const event = new CustomEvent('auth-required', {
            detail: {returnUrl: currentPath}
        });
        document.dispatchEvent(event);
    }

// 저장된 토큰 검증 메서드 추가
    validateStoredTokens() {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();

        if (!accessToken || !refreshToken) {
            console.warn('저장된 토큰 중 일부가 누락되었습니다.');
            this.clearTokens();
            return false;
        }

        // 액세스 토큰 만료 확인
        if (this.isTokenExpired(accessToken)) {
            console.log('액세스 토큰 만료, 리프레시 토큰으로 갱신 시도');
            this.refreshToken();
        }

        return true;
    }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();

// 전역으로 접근 가능하도록 설정
window.AuthService = authService;