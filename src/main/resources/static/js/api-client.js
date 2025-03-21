/**
 * api-client.js
 * API 요청과 응답을 처리하는 클라이언트 모듈
 */

class ApiClient {
    constructor() {
        this.pendingRequests = 0;
        this.setupFetchInterceptor();
    }

    /**
     * fetch API를 가로채서 요청 전/후 처리를 추가하는 인터셉터 설정
     */
    setupFetchInterceptor() {
        const originalFetch = window.fetch;

        window.fetch = async (url, options = {}) => {
            const isApiRequest = typeof url === 'string' && (url.includes('/api/') || url.startsWith('/api/'));

            if (!isApiRequest) {
                return originalFetch(url, options);
            }

            try {
                options.headers = options.headers || {};
                options = this.addAuthHeaders(options);

                this.startLoading();
                let response = await originalFetch(url, options);

                // 응답 처리 - 401 오류 발생 시 인증 필요 알림
                return await this.handleResponse(response);
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
     * 요청에 인증 관련 설정 추가
     * 세션 쿠키를 자동으로 전송하도록 credentials 옵션 설정
     */
    addAuthHeaders(options) {
        // 세션 기반 인증을 위해 모든 요청에 credentials: 'include' 추가
        options.credentials = 'include';
        return options;
    }


    /**
     * API 응답 처리
     * 401 Unauthorized 등 특별한 응답 상태에 대한 처리
     */
    async handleResponse(response) {
        // 401 Unauthorized 처리
        if (response.status === 401) {
            console.warn('Unauthorized 에러 발생');

            // 인증 필요 이벤트 발송
            if (window.AuthService) {
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
     * 오류 메시지 표시
     */
    showErrorMessage(message) {
        if (window.showToast) {
            window.showToast(message, '오류', 'error');
        } else {
            console.error('오류 메시지:', message);
        }
    }

    /**
     * API 요청 시작 시 로딩 상태 표시
     */
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

    /**
     * API 요청 종료 시 로딩 상태 해제
     */
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