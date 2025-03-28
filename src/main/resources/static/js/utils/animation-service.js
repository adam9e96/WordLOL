/**
 * animation-service.js
 * 재사용 가능한 애니메이션 유틸리티 모듈
 * anime.js를 사용하여 다양한 애니메이션 효과를 제공합니다.
 */

class AnimationService {

    constructor() {
        // anime.js가 로드되었는지 확인
        this.isAnimeAvailable = typeof anime !== 'undefined';

        // anime.js가 없으면 경고 표시
        if (!this.isAnimeAvailable) {
            console.warn('애니메이션 서비스를 위해 anime.js가 필요합니다. 스크립트를 포함해주세요.');
        }
    }

    /**
     * 선택자 또는 요소를 애니메이션 타겟으로 변환
     * @param {string|HTMLElement|NodeList|Array} selector - CSS 선택자 또는 DOM 요소
     * @returns {HTMLElement|HTMLElement[]|null} 애니메이션 타겟
     */
    getTarget(selector) {
        if (!selector) return null;

        // 이미 DOM 요소인 경우
        if (selector instanceof HTMLElement) {
            return selector;
        }

        // 노드 리스트나 배열인 경우
        if (selector instanceof NodeList || Array.isArray(selector)) {
            return Array.from(selector);
        }

        // 문자열(CSS 선택자)인 경우
        if (typeof selector === 'string') {
            return document.querySelectorAll(selector);
        }

        return null;
    }

    /**
     * 기본 애니메이션 실행 메서드
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {Object} props - 애니메이션 속성
     * @param {Object} options - 애니메이션 옵션
     * @returns {Object|null} anime.js 인스턴스 또는 null
     */
    animate(targets, props, options = {}) {
        if (!this.isAnimeAvailable) return null;

        const targetElements = this.getTarget(targets);
        if (!targetElements) return null;

        return anime({
            targets: targetElements,
            ...props,
            ...options
        });
    }

    /**
     * 페이드 인 애니메이션
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {Object} options - 추가 옵션
     */
    fadeIn(targets, options = {}) {
        return this.animate(targets, {
            opacity: [0, 1],
            translateY: [options.distance || 20, 0],
            duration: options.duration || 800,
            easing: options.easing || 'easeOutExpo',
            delay: options.delay || 0
        });
    }

    /**
     * 페이드 아웃 애니메이션
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {Object} options - 추가 옵션
     */
    fadeOut(targets, options = {}) {
        return this.animate(targets, {
            opacity: [1, 0],
            translateY: [0, options.distance || 20],
            duration: options.duration || 800,
            easing: options.easing || 'easeInExpo',
            delay: options.delay || 0
        });
    }

    /**
     * 슬라이드 인 애니메이션
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {string} direction - 방향 ('left', 'right', 'up', 'down')
     * @param {Object} options - 추가 옵션
     */
    slideIn(targets, direction = 'left', options = {}) {
        const distance = options.distance || 100;
        let translateProps = {};

        switch (direction) {
            case 'left':
                translateProps = { translateX: [-distance, 0] };
                break;
            case 'right':
                translateProps = { translateX: [distance, 0] };
                break;
            case 'up':
                translateProps = { translateY: [-distance, 0] };
                break;
            case 'down':
                translateProps = { translateY: [distance, 0] };
                break;
            default:
                translateProps = { translateX: [-distance, 0] };
        }

        return this.animate(targets, {
            opacity: [0, 1],
            ...translateProps,
            duration: options.duration || 800,
            easing: options.easing || 'easeOutQuad',
            delay: options.delay || 0
        });
    }

    /**
     * 슬라이드 아웃 애니메이션
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {string} direction - 방향 ('left', 'right', 'up', 'down')
     * @param {Object} options - 추가 옵션
     */
    slideOut(targets, direction = 'left', options = {}) {
        const distance = options.distance || 100;
        let translateProps = {};

        switch (direction) {
            case 'left':
                translateProps = { translateX: [0, -distance] };
                break;
            case 'right':
                translateProps = { translateX: [0, distance] };
                break;
            case 'up':
                translateProps = { translateY: [0, -distance] };
                break;
            case 'down':
                translateProps = { translateY: [0, distance] };
                break;
            default:
                translateProps = { translateX: [0, -distance] };
        }

        return this.animate(targets, {
            opacity: [1, 0],
            ...translateProps,
            duration: options.duration || 800,
            easing: options.easing || 'easeInQuad',
            delay: options.delay || 0
        });
    }

    /**
     * 확대/축소 애니메이션
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {boolean} zoomIn - 확대(true) 또는 축소(false)
     * @param {Object} options - 추가 옵션
     */
    zoom(targets, zoomIn = true, options = {}) {
        const scaleFrom = zoomIn ? 0.5 : 1;
        const scaleTo = zoomIn ? 1 : 0.5;
        const opacityFrom = zoomIn ? 0 : 1;
        const opacityTo = zoomIn ? 1 : 0;

        return this.animate(targets, {
            scale: [scaleFrom, scaleTo],
            opacity: [opacityFrom, opacityTo],
            duration: options.duration || 600,
            easing: options.easing || 'easeOutExpo',
            delay: options.delay || 0
        });
    }

    /**
     * 회전 애니메이션
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {Object} options - 추가 옵션
     */
    rotate(targets, options = {}) {
        return this.animate(targets, {
            rotate: [options.from || 0, options.to || '1turn'],
            duration: options.duration || 1000,
            easing: options.easing || 'easeInOutSine',
            delay: options.delay || 0
        });
    }

    /**
     * 흔들림 애니메이션 (오류 피드백 등에 유용)
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {Object} options - 추가 옵션
     */
    shake(targets, options = {}) {
        return this.animate(targets, {
            translateX: [
                0,
                options.intensity || -10,
                options.intensity || 10,
                options.intensity * -0.5 || -5,
                options.intensity * 0.5 || 5,
                0
            ],
            duration: options.duration || 600,
            easing: options.easing || 'easeInOutSine',
            delay: options.delay || 0
        });
    }

    /**
     * 펄스 애니메이션 (주의 집중에 유용)
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {Object} options - 추가 옵션
     */
    pulse(targets, options = {}) {
        return this.animate(targets, {
            scale: [1, options.scale || 1.05, 1],
            duration: options.duration || 600,
            easing: options.easing || 'easeInOutQuad',
            delay: options.delay || 0,
            loop: options.loop || false
        });
    }

    /**
     * 순차적 애니메이션 (여러 요소에 지연 적용)
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {Object} props - 애니메이션 속성
     * @param {Object} options - 추가 옵션
     */
    staggered(targets, props, options = {}) {
        return this.animate(targets, {
            ...props,
            delay: anime.stagger(options.staggerDelay || 100, {
                start: options.staggerStart || 0,
                from: options.staggerFrom || 'first'
            }),
            duration: options.duration || 800,
            easing: options.easing || 'easeOutExpo'
        });
    }

    /**
     * 텍스트 타이핑 애니메이션
     * 각 글자가 하나씩 나타나는 효과
     * @param {string|HTMLElement} target - 타겟 요소 (한 개의 요소만 가능)
     * @param {string} text - 표시할 텍스트
     * @param {Object} options - 추가 옵션
     */
    typeText(target, text, options = {}) {
        if (!this.isAnimeAvailable) return null;

        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement || !(targetElement instanceof HTMLElement)) return null;

        // 기존 텍스트 저장 및 초기화
        const originalText = targetElement.innerText;
        targetElement.innerText = '';

        const characters = text.split('');
        const duration = options.duration || 1000;
        const charDuration = duration / characters.length;

        // 각 문자별로 span 요소 생성 및 추가
        characters.forEach((char, i) => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            charSpan.style.opacity = '0';
            targetElement.appendChild(charSpan);

            // 각 문자 애니메이션
            setTimeout(() => {
                anime({
                    targets: charSpan,
                    opacity: 1,
                    duration: charDuration * 0.5,
                    easing: 'easeInQuad'
                });
            }, i * charDuration);
        });

        return {
            reset: () => {
                targetElement.innerText = originalText;
            }
        };
    }

    /**
     * 요소를 클릭했을 때 파동 효과
     * @param {string|HTMLElement} target - 대상 요소
     * @param {Object} options - 추가 옵션
     */
    ripple(target, options = {}) {
        if (!this.isAnimeAvailable) return null;

        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement || !(targetElement instanceof HTMLElement)) return null;

        // 이벤트 리스너 추가
        targetElement.addEventListener('click', (e) => {
            // 현재 위치 계산
            const rect = targetElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 리플 효과를 위한 요소 생성
            const ripple = document.createElement('span');
            ripple.classList.add('animation-ripple');
            ripple.style.position = 'absolute';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.width = '0';
            ripple.style.height = '0';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = options.color || 'rgba(255, 255, 255, 0.4)';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.pointerEvents = 'none';

            // 요소의 position이 static이면 relative로 변경
            const position = getComputedStyle(targetElement).position;
            if (position === 'static') {
                targetElement.style.position = 'relative';
            }

            targetElement.appendChild(ripple);

            // 애니메이션 적용
            anime({
                targets: ripple,
                width: options.size || [0, rect.width * 2],
                height: options.size || [0, rect.width * 2],
                opacity: [0.5, 0],
                duration: options.duration || 800,
                easing: 'easeOutExpo',
                complete: () => {
                    targetElement.removeChild(ripple);
                }
            });
        });

        return {
            destroy: () => {
                targetElement.removeEventListener('click', null);
            }
        };
    }

    /**
     * SVG 경로 드로잉 애니메이션
     * @param {string|HTMLElement|NodeList} targets - SVG 경로 요소
     * @param {Object} options - 추가 옵션
     */
    drawSVGPath(targets, options = {}) {
        if (!this.isAnimeAvailable) return null;

        return this.animate(targets, {
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: options.easing || 'easeInOutSine',
            duration: options.duration || 1500,
            delay: options.delay || 0,
            direction: options.direction || 'normal',
            loop: options.loop || false
        });
    }

    /**
     * 색상 변경 애니메이션
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {string} property - 변경할 색상 속성 (backgroundColor, color 등)
     * @param {string|string[]} from - 시작 색상 또는 색상 배열
     * @param {string|string[]} to - 종료 색상 또는 색상 배열
     * @param {Object} options - 추가 옵션
     */
    colorChange(targets, property, from, to, options = {}) {
        const props = {};
        props[property] = [from, to];

        return this.animate(targets, {
            ...props,
            duration: options.duration || 800,
            easing: options.easing || 'easeInOutQuad',
            delay: options.delay || 0
        });
    }

    /**
     * 3D 플립 애니메이션
     * @param {string|HTMLElement} front - 앞면 요소
     * @param {string|HTMLElement} back - 뒷면 요소
     * @param {Object} options - 추가 옵션
     */
    flip3D(front, back, options = {}) {
        if (!this.isAnimeAvailable) return null;

        const frontElement = typeof front === 'string' ? document.querySelector(front) : front;
        const backElement = typeof back === 'string' ? document.querySelector(back) : back;

        if (!frontElement || !backElement) return null;

        // 초기 설정
        anime.set(frontElement, { backfaceVisibility: 'hidden' });
        anime.set(backElement, {
            backfaceVisibility: 'hidden',
            rotateY: '180deg',
            opacity: 0
        });

        // 플립 애니메이션
        const frontAnim = anime({
            targets: frontElement,
            rotateY: options.reverse ? ['-180deg', '0deg'] : ['0deg', '180deg'],
            opacity: options.reverse ? [0, 1] : [1, 0],
            easing: options.easing || 'easeInOutSine',
            duration: options.duration || 800,
            delay: options.delay || 0
        });

        const backAnim = anime({
            targets: backElement,
            rotateY: options.reverse ? ['0deg', '180deg'] : ['180deg', '0deg'],
            opacity: options.reverse ? [1, 0] : [0, 1],
            easing: options.easing || 'easeInOutSine',
            duration: options.duration || 800,
            delay: options.delay || 0
        });

        return {
            front: frontAnim,
            back: backAnim
        };
    }

    /**
     * 스크롤 트리거 애니메이션
     * 요소가 화면에 나타날 때 애니메이션 실행
     * @param {string|HTMLElement|NodeList} targets - 애니메이션 대상
     * @param {Object} props - 애니메이션 속성
     * @param {Object} options - 추가 옵션
     */
    scrollTrigger(targets, props, options = {}) {
        if (!this.isAnimeAvailable) return null;

        const targetElements = this.getTarget(targets);
        if (!targetElements) return null;

        // IntersectionObserver 설정
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 화면에 들어왔을 때 애니메이션 실행
                    anime({
                        targets: entry.target,
                        ...props,
                        duration: options.duration || 800,
                        easing: options.easing || 'easeOutExpo',
                        delay: options.delay || 0
                    });

                    // 한 번만 실행하는 경우 관찰 중단
                    if (options.once !== false) {
                        observer.unobserve(entry.target);
                    }
                } else if (options.reverseOnExit) {
                    // 화면에서 나갔을 때 반대 애니메이션 실행
                    anime({
                        targets: entry.target,
                        // 원래의 속성 값을 반대로 설정
                        ...Object.entries(props).reduce((acc, [key, value]) => {
                            if (Array.isArray(value)) {
                                acc[key] = [value[1], value[0]];
                            } else {
                                acc[key] = value;
                            }
                            return acc;
                        }, {}),
                        duration: options.duration || 800,
                        easing: options.easing || 'easeOutExpo',
                        delay: options.delay || 0
                    });
                }
            });
        }, {
            root: options.root || null,
            rootMargin: options.rootMargin || '0px',
            threshold: options.threshold || 0.1
        });

        // 각 요소 관찰 시작
        const elements = Array.isArray(targetElements) ? targetElements : [targetElements];
        elements.forEach(el => observer.observe(el));

        return {
            observer,
            // 관찰 중단 메서드
            destroy: () => {
                elements.forEach(el => observer.unobserve(el));
            }
        };
    }

    /**
     * 요소 내부의 진행 표시기 애니메이션
     * @param {string|HTMLElement} target - 타겟 요소
     * @param {number} percentage - 진행률 (0-100)
     * @param {Object} options - 추가 옵션
     */
    progress(target, percentage, options = {}) {
        if (!this.isAnimeAvailable) return null;

        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        if (!targetElement) return null;

        // 진행률 표시 요소 생성 또는 찾기
        let progressBar = targetElement.querySelector('.animation-progress-bar');
        if (!progressBar) {
            // position 설정
            const position = getComputedStyle(targetElement).position;
            if (position === 'static') {
                targetElement.style.position = 'relative';
            }

            progressBar = document.createElement('div');
            progressBar.classList.add('animation-progress-bar');
            progressBar.style.position = 'absolute';
            progressBar.style.bottom = '0';
            progressBar.style.left = '0';
            progressBar.style.height = options.height || '4px';
            progressBar.style.backgroundColor = options.color || '#6750A4';
            progressBar.style.width = '0%';
            progressBar.style.transition = 'width 0.3s ease-out';

            targetElement.appendChild(progressBar);
        }

        // 진행률 애니메이션
        return this.animate(progressBar, {
            width: `${percentage}%`,
            duration: options.duration || 800,
            easing: options.easing || 'easeInOutQuad',
            delay: options.delay || 0
        });
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const animationService = new AnimationService();
export default animationService;

// 전역 접근을 위한 윈도우 객체에 할당 (옵션)
window.AnimationService = animationService;