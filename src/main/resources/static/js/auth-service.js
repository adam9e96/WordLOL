/**
 * @class AuthService
 * @description 애플리케이션의 인증 관련 기능을 담당하는 서비스 클래스
 */
class AuthService {
    /**
     * 스토리지 키 상수 정의
     * @static
     * @readonly
     */
    static TOKEN_KEYS = {
        ACCESS_TOKEN: 'wordlol_access_token',
        REFRESH_TOKEN: 'wordlol_refresh_token',
        TOKEN_TYPE: 'wordlol_token_type',
        USER_INFO: 'wordlol_user_info'
    };

    /**
     * 인증 관련 API 엔드포인트 정의
     * @static
     * @readonly
     *
     * @property {string} AUTH_ME - 사용자 정보를 가져오는 API 엔드포인트
     * @property {string} REFRESH_TOKEN - 토큰 갱신을 위한 API 엔드포인트
     * @property {string} OAUTH_LOGIN - 구글 OAuth 로그인 API 엔드포인트
     */
    static API_ENDPOINTS = {
        AUTH_ME: '/api/v1/auth/me',
        REFRESH_TOKEN: '/api/v1/auth/refresh',
        OAUTH_LOGIN: '/oauth2/authorization/google'
    };

    constructor() {
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
     * 인증 토큰을 로컬 스토리지에 저장하는 메소드
     *
     * JWT 인증에 필요한 액세스 토큰, 리프레시 토큰 및 토큰 타입을 로컬 스토리지에 저장합니다.
     * 저장 전에 토큰 유효성을 검증하여 잘못된 토큰이 저장되는 것을 방지합니다.
     *
     * 사용 시나리오
     * 1. 초기 로그인 시 토큰 발급
     * 2. 액세스 토큰 갱신 시
     *
     * @param {Object} tokenData - 저장할 토큰 정보
     * @param {string} tokenData.accessToken - 액세스 토큰
     * @param {string} tokenData.refreshToken - 리프레시 토큰
     * @param {string} [tokenData.tokenType='Bearer'] - 토큰 타입 (기본값: 'Bearer')
     * @returns {boolean} 토큰 저장 성공 여부 (성공: true, 실패: false)
     *
     * @example
     * const tokenData = {
     *   accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
     *   refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
     *   tokenType: 'Bearer'
     * };
     * const saved = this.saveTokens(tokenData);
     * if (saved) {
     *   console.log('토큰이 성공적으로 저장되었습니다');
     * }
     */
    saveTokens(tokenData) {
        try {
            // 매개변수 검증
            if (!tokenData) {
                console.error('토큰 데이터가 없습니다');
                return false;
            }

            // 토큰 데이터에서 액세스 토큰, 리프레시 토큰 및 토큰 타입 추출
            const accessToken = tokenData.accessToken;
            const refreshToken = tokenData.refreshToken;
            const tokenType = tokenData.tokenType || 'Bearer';

            // 액세스 토큰 값 검증
            if (!accessToken || typeof accessToken !== 'string') {
                console.error('유효하지 않은 액세스 토큰:', accessToken);
                return false;
            }

            // 리프레시 토큰 값 검증
            if (!refreshToken || typeof refreshToken !== 'string') {
                console.error('유효하지 않은 리프레시 토큰:', refreshToken);
                return false;
            }

            // JWT 형식 검증 (간단한 형식 체크)
            const isValidJwt = (token) => {
                const parts = token.split('.');
                return parts.length === 3;
            };

            if (!isValidJwt(accessToken) || !isValidJwt(refreshToken)) {
                console.error('토큰이 유효한 JWT 형식이 아닙니다');
                return false;
            }

            // 토큰 저장
            localStorage.setItem(AuthService.TOKEN_KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(AuthService.TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
            localStorage.setItem(AuthService.TOKEN_KEYS.TOKEN_TYPE, tokenType);

            // 저장된 토큰 확인
            const savedAccessToken = localStorage.getItem(AuthService.TOKEN_KEYS.ACCESS_TOKEN);
            const savedRefreshToken = localStorage.getItem(AuthService.TOKEN_KEYS.REFRESH_TOKEN);

            if (savedAccessToken !== accessToken || savedRefreshToken !== refreshToken) {
                console.error('토큰 저장 확인 실패');
                return false;
            }

            console.log('토큰이 성공적으로 저장되었습니다');
            return true;
        } catch (error) {
            console.error('토큰 저장 중 오류 발생:', error.message);
            return false;
        }
    }

    /**
     * 사용자가 로그아웃할 때 로컬 스토리지에 저장된 모든 인증 관련 데이터를 삭제하는 기능
     *
     * 사용 시나리오
     * - 로그아웃 버튼 클릭 시
     * - 리프레시 토큰이 없는 경우
     * - 토큰 갱신 과정에서 오류 발생
     * - 저장된 토큰 검증 실패 시
     * - API 요청 시 401 에러 발생 시
     *
     * 삭제되는 키:
     * - wordlol_access_token
     * - wordlol_refresh_token
     * - wordlol_token_type
     * - wordlol_user_info
     *
     */
    clearTokens() {
        Object.values(AuthService.TOKEN_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    /**
     * 액세스 토큰 가져오기
     * @returns {string|null} 저장된 액세스 토큰 또는 토큰이 없는 경우 null
     */
    getAccessToken() {
        return window.localStorage.getItem(AuthService.TOKEN_KEYS.ACCESS_TOKEN);
    }

    /**
     * 리프레시 토큰 가져오기
     * @returns {string|null} 저장된 리프레시 토큰 또는 토큰이 없는 경우 null
     */
    getRefreshToken() {
        return localStorage.getItem(AuthService.TOKEN_KEYS.REFRESH_TOKEN);
    }

    /**
     * 토큰 타입 가져오기
     * @returns {string} 저장된 토큰 타입. 없는경우 기본값 'Bearer' 반환
     */
    getTokenType() {
        return localStorage.getItem(AuthService.TOKEN_KEYS.TOKEN_TYPE) || 'Bearer';
    }

    /**
     * 인증 요청에 사용할 Authorization 헤더를 생성합니다.
     *
     * 이 메서드는 저장된 액세스 토큰이 유효한 경우
     * "Bearer {token}" 형식의 인증 헤더를 반환합니다.
     *
     * @returns {Object|null} 인증 헤더 객체 또는 null
     */
    getAuthHeader() {
        // 액세스 토큰 가져오기
        const accessToken = this.getAccessToken();

        // 토큰이 없는 경우
        if (!accessToken) {
            console.warn("인증 헤더를 생성할 수 없음: 액세스 토큰 is null");
            return null;
        }

        // 토큰 만료 확인
        if (this.isTokenExpired(accessToken)) {
            console.log("액세스 토큰이 만료됨. 갱신이 필요함");
            this.refreshTokens();
            return null;
        }

        // 유효한 토큰으로 인증 헤더 반환
        const tokenType = this.getTokenType();
        return {
            'Authorization': `${tokenType} ${accessToken}`
        };
    }


    /**
     * 사용자의 로그인 상태를 확인합니다.
     * 로컬 스토리지에 액세스 토큰이 존재하는지 여부를 확인합니다.
     * 사용)
     * - 페이지 접근 제어 (인증 필요 기능 사용 전 상태 확인)
     * - UI 업데이트 (로그인/로그아웃 상태에 따라 화면 요소 표시/숨김)
     * - API 요청 전 인증상태 확인
     *
     * @returns {boolean} 사용자가 로그인되어 있으면 true, 그렇지 않으면 false
     */
    isAuthenticated() {
        // getAccessToken()은 문자열(토큰값) 또는 null 을 반환
        const token = this.getAccessToken();

        // !! 연산자로 값을 boolean 으로 변환:
        // - token 이 null 이 아니면 (토큰이 존재하면) → true
        // - token 이 null 이면 (토큰이 없으면) → false
        return !!token;
    }


    /**
     * JSON Web Token(JWT)을 디코딩하여 페이로드를 추출합니다.
     * JWT 의 중간 부분인 페이로드를 Base64 디코딩하여 반환합니다.
     *
     * @param {string} token - 디코딩할 JWT 토큰 문자열
     * @returns {Object|null} 디코딩된 토큰 페이로드(클레임 세트) 객체 또는
     *                        토큰이 유효하지 않거나 오류 발생 시 null
     * @throws {Error} 토큰 디코딩 중 오류가 발생할 수 있으나 내부에서 처리됨
     *
     * @example
     * // 페이로드에 접근하는 예시
     * const payload = authService.decodeToken(accessToken);
     * if (payload) {
     *   console.log('사용자 ID:', payload.sub);
     *   console.log('만료 시간:', new Date(payload.exp * 1000));
     * }
     */
    decodeToken(token) {
        try {
            // 토큰이 없으면 null 반환
            if (!token) {
                return null;
            }

            // 토큰을 '.'으로 분리하여 페이로드 부분을 Base64 디코딩
            const base64Url = token.split('.')[1];
            // 분리한 페이로드 부분을 URL-safe 한 Base64 문자열로 변환
            // '-'과 '_'를 각각 '+'와 '/'로 변환
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

            // base64 문자열을 원래의 JSON 문자열로 디코딩
            const decodedJWT = JSON.parse(window.atob(base64));

            /*
             * ex) 예시
             * {
             * sub: 'fpkm99999@gmail.com',
             * exp: '2025-03-21T05:22:39.000Z',
             * currentTime: '2025-03-21T06:06:43.624Z'
             * }
             */
            console.log('디코딩된 토큰 페이로드:', {
                sub: decodedJWT.sub,
                exp: new Date(decodedJWT.exp * 1000).toISOString(),
                currentTime: new Date().toISOString()
            });

            return decodedJWT;
        } catch (error) {
            console.error('토큰 디코딩 오류:', error);
            return null;
        }
    }

    /**
     * JWT 토큰이 만료되었는지 확인하는 기능
     *
     * @param token
     * @returns {boolean}
     */
    isTokenExpired(token) {
        try {
            const payload = this.decodeToken(token);

            // 만약 페이로드가 null 이거나 exp 필드가 없으면 검증 실패
            if (!payload || !payload.exp) {
                console.warn('토큰 페이로드 검증 실패', {payload});
                return true;
            }

            // 시간 계산
            const tokenExpiryTime = payload.exp * 1000; // exp는 초 단위로 되어 있으므로 밀리초로 변환
            const currentTime = Date.now(); // 현재 시간 (밀리초)
            const preRefreshBufferTime = 60 * 1000; // 버퍼 시간 (밀리초)  == 60초

            // 디버깅을 위한 상세 정보 출력
            console.log('토큰 만료 검사 상세 정보:', {
                tokenExpiryTime: new Date(currentTime).toISOString(),
                currentTime: new Date(tokenExpiryTime).toISOString(),
                preRefreshBufferTime: preRefreshBufferTime + 'ms',
                tokenPayload: payload
            });

            // 만료 여부 확인 : (현재 시간 + 미리 갱신할 여유시간)이 만료 시간보다 큰지 확인
            // 1분 전부터 만료된 것으로 간주하여 리프레시 토큰 요청
            // true : 만료됨, false : 만료되지 않음
            // ex) 현재시간 + 1분 > 만료시간, 실제 만료 시간이 10:00:00 이라면 9:59:00 부터 만료된 것으로 간주
            const isExpired = (currentTime + preRefreshBufferTime) > tokenExpiryTime;

            console.log('토큰 만료 상태:', isExpired);

            return isExpired;
        } catch (error) {
            console.error('토큰 만료 확인 중 오류:', error);
            return true;
        }
    }


    /**
     * 액세스 토큰 및 리프레시 토큰을 갱신하는 메소드
     *
     * 만료되었거나 곧 만료될 액세스 토큰을 리프레시 토큰을 사용하여 갱신합니다.
     * 이 메소드는 로컬 스토리지에서 리프레시 토큰을 가져와 서버에 요청을 보내고,
     * 새로운 액세스 토큰과 리프레시 토큰을 받아 저장합니다.
     *
     * @async
     * @returns {Promise<boolean>} 토큰 갱신 성공 여부 (성공: true, 실패: false)
     *
     * @example
     * // 토큰이 만료되었을 때 갱신 시도
     * if (this.isTokenExpired(accessToken)) {
     *   const refreshSuccess = await this.refreshToken();
     *   if (!refreshSuccess) {
     *     // 갱신 실패 처리
     *     this.handleLogout(true);
     *   }
     * }
     */
    async refreshTokens() {
        // 로컬 스토리지에서 리프레시 토큰 가져오기
        const refreshToken = this.getRefreshToken();

        // 리프레시 토큰이 없으면 실패 처리
        if (!refreshToken) {
            console.warn('리프레시 토큰 없음');
            this.clearTokens();
            this.notifyAuthRequired();
            return false;
        }

        // 리프레시 토큰이 있는 경우
        try {
            // 서버에 리프레시 토큰으로 새 액세스 토큰 요청(+ 리프레시 토큰도 갱신)
            const response = await fetch(AuthService.API_ENDPOINTS.REFRESH_TOKEN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({refreshToken})
            });

            // 응답 실패 시
            if (!response.ok) {
                throw new Error(`토큰 갱신 실패: ${response.status}`);
            }

            // 응답 성공 시 JSON 데이터 파싱 및 저장
            const tokenData = await response.json();

            if (!this.saveTokens(tokenData)) {
                throw new Error('새 토큰 저장 실패');
            }

            // 토큰 저장(갱신) 성공 시
            // 인증 상태 변경 알림
            this.notifyAuthStateChanged(true);
            return true;

        } catch (error) {
            console.error('토큰 갱신 과정에서 오류 발생:', error);
            this.clearTokens();
            this.notifyAuthRequired();
            return false;
        }
    }

    /**
     * 토큰 유효성 확인 및 필요 시 갱신
     */
    async validateAndRefreshTokenIfNeeded() {
        // 방어적 차원에서 한번 더 인증 상태 확인
        if (!this.isAuthenticated()) {
            console.log('인증되지 않은 상태');
            return false;
        }

        // 액세스 토큰 가져오기
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
                return await this.refreshTokens();
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
     * 1. 로그인 시작
     * 지정된 리다이렉트 URI를 로컬 스토리지에 저장하고 구글 로그인 페이지로 이동
     * 구글 OAuth 로그인 처리
     * @param {string} redirectUri - 로그인 후 리다이렉트할 URI
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
     * @param {boolean} redirect - 로그아웃 후 리다이렉트 여부
     * @param {string} redirectUrl - 리다이렉트할 URL
     */
    handleLogout(redirect = true, redirectUrl = '/') {
        this.clearTokens();
        this.notifyAuthStateChanged(false);

        if (redirect) {
            window.location.href = redirectUrl;
        }
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
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();
/**
 * 전역으로 접근 가능하도록 설정 (생성된 인스턴스를 window 객체의 속성으로 할당)
 * ex) window.AuthService.handleGoogleLogin();
 * @type {AuthService}
 */
window.AuthService = authService;