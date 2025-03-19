/**
 * api-client.js
 * API 요청과 응답을 처리하는 클라이언트 모듈
 */

class ApiClient {
    constructor() {
        this.pendingRequests = 0;
        this.setupFetchInterceptor();
    }

// setupFetchInterceptor 메서드 내에서 addAuthHeaders 사용
    setupFetchInterceptor() {
        const originalFetch = window.fetch;

        window.fetch = async (url, options = {}) => {
            const isApiRequest = typeof url === 'string' && (url.includes('/api/') || url.startsWith('/api/'));

            if (!isApiRequest) {
                return originalFetch(url, options);
            }

            try {
                // options에 headers가 없으면 초기화
                options.headers = options.headers || {};

                // addAuthHeaders 메서드 사용
                options = this.addAuthHeaders(options);

                // 기존 로직 유지
                this.startLoading();
                let response = await originalFetch(url, options);

                // 401 에러 처리 로직
                if (response.status === 401 && window.AuthService) {
                    const refreshed = await window.AuthService.refreshToken();
                    if (refreshed) {
                        // 갱신된 토큰으로 다시 헤더 추가
                        options = this.addAuthHeaders(options);
                        response = await originalFetch(url, options);
                    } else {
                        this.handleUnauthorized();
                    }
                }

                response = await this.handleResponse(response);
                return response;
            } catch (error) {
                console.error(`요청 오류: ${url}`, error);
                this.showErrorMessage(error.message);
                throw error;
            } finally {
                this.endLoading();
            }
        };
    }
    /**
     * 요청에 인증 헤더 추가
     */
    addAuthHeaders(options) {
        console.log('현재 요청 옵션:', options);

        const hasAuthHeader = options.headers &&
            (options.headers.Authorization || options.headers['Authorization']);

        console.log('기존 인증 헤더 존재 여부:', hasAuthHeader);

        if (!hasAuthHeader && window.AuthService && window.AuthService.isAuthenticated()) {
            const authHeader = window.AuthService.getAuthHeader();
            console.log('생성된 인증 헤더:', authHeader);

            if (authHeader) {
                options.headers = {
                    ...options.headers || {},
                    ...authHeader
                };
            }
        }

        return options;
    }


    /**
     * API 응답 처리
     */
    async handleResponse(response) {
        // 401 Unauthorized 처리
        if (response.status === 401) {
            console.warn('Unauthorized 에러 발생');

            // 토큰 제거 및 로그인 페이지로 리다이렉트
            if (window.AuthService) {
                window.AuthService.clearTokens();
                window.AuthService.notifyAuthRequired();
            }

            // 현재 경로 저장
            const currentPath = window.location.pathname + window.location.search;
            localStorage.setItem('auth_redirect_uri', currentPath);

            // 로그인 페이지로 리다이렉트
            window.location.href = '/login';

            throw new Error('인증이 필요합니다.');
        }

        // 기존 응답 처리 로직 유지
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '알 수 없는 오류가 발생했습니다.');
        }

        return response;
    }

    /**
     * 401 인증 실패 처리
     */
    handleUnauthorized() {
        if (window.AuthService) {
            // 로컬 토큰 삭제
            window.AuthService.clearTokens();

            // 인증 필요 이벤트 발생
            window.AuthService.notifyAuthRequired();
        }

        this.showErrorMessage('인증이 필요합니다. 로그인 후 이용해주세요.');
    }

    /**
     * 오류 메시지 표시
     */
    showErrorMessage(message) {
        if (window.showToast) {
            window.showToast(message, '오류', 'error');
        } else {
            console.error('오류 메시지:', message);
        }
    }

    startLoading() {
        this.pendingRequests++;
        console.log('로딩 요청 시작:', this.pendingRequests);

        if (this.pendingRequests === 1) {
            // 다음 이벤트 루프에서 로딩 UI 표시
            setTimeout(() => {
                if (window.showLoading && this.pendingRequests > 0) {
                    window.showLoading(true);
                }
            }, 0);
        }
    }

    endLoading() {
        this.pendingRequests = Math.max(0, this.pendingRequests - 1);
        console.log('로딩 요청 종료:', this.pendingRequests);

        if (this.pendingRequests === 0) {
            // 다음 이벤트 루프에서 로딩 UI 숨김
            setTimeout(() => {
                if (window.showLoading) {
                    window.showLoading(false);
                }
            }, 0);
        }
    }

    /**
     * GET 요청
     */
    async get(url, options = {}) {
        return fetch(url, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * POST 요청
     */
    async post(url, data, options = {}) {
        return fetch(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers || {}
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT 요청
     */
    async put(url, data, options = {}) {
        return fetch(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers || {}
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE 요청
     */
    async delete(url, options = {}) {
        return fetch(url, {
            ...options,
            method: 'DELETE'
        });
    }
}

// 싱글톤 인스턴스 생성
const apiClient = new ApiClient();

// 전역으로 접근 가능하도록 설정
window.ApiClient = apiClient;