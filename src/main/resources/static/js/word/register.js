// DOM 이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', function () {
    // 필요한 DOM 요소들을 변수에 저장
    const form = document.getElementById('wordForm'); // 단어 등록 폼
    const toast = document.getElementById('toast'); // 토스트 메시지 컨테이너
    const bsToast = new bootstrap.Toast(toast); // Bootstrap 토스트 인스턴스 생성
    const cancelButton = document.getElementById('cancelBtn'); // 취소 버튼

    // 폼 제출 이벤트 리스너
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); //  폼의 기본 제출 동작(서버로 전송하는 것)을 방지

        // 폼 유효성 검사(HTML 기본 유효성 검사 기능
        // 1. FORM 내의 required 속성으로 지정된 필수 입력 필드들이 채워졌는지 검사
        if (!form.checkValidity()) {
            e.stopPropagation(); // 폼이 잘못된 상태에서 이벤트가 계속 전파되는 것을 방지
            form.classList.add('was-validated'); // 이벤트 전파 중지
            // (→ Bootstrap의 유효성 검사 스타일을 적용하여 입력 필드의 유효/무효 상태를 시각적으로 표시)

            // 유효하지 않은 필드 찾기
            // vocabulary, meaning, difficulty 가 올 수있음
            const invalidField = form.querySelector(':invalid'); //  CSS 선택자를 사용하여 폼 내부에서
            // 유효하지 않은 입력 필드(즉, 잘못된 입력값이 있는 요소)를 찾음
            // ex) required 가 있는 입력필드가 비어 있거나 type="email" 인 필드에 잘못된 이메일 형식이 입력된 경우 etc..

            if (invalidField) {
                invalidField.focus(); // 유효하지 않은 필드에 포커스
                showToast('필수 항목을 입력해주세요.', 'danger');
            }
            return;
        }

        // 폼 데이터 수집 및 객체화
        const wordData = {
            vocabulary: document.getElementById('vocabulary').value,
            meaning: document.getElementById('meaning').value,
            hint: document.getElementById('hint').value,
            difficulty: parseInt(document.querySelector('input[name="difficulty"]:checked').value)  // 수정된 부분
        };

        // 추가 유효성 검사
        // 개별 필드 값 복사
        // vocabulary 필드 검사
        if (!wordData.vocabulary) {
            const vocabularyInput = document.getElementById('vocabulary');
            vocabularyInput.focus();
            showToast('영단어를 입력해주세요.', 'danger');
            return;
        }

        // meaning 필드 검사
        if (!wordData.meaning) {
            const meaningInput = document.getElementById('meaning');
            meaningInput.focus();
            showToast('뜻을 입력해주세요.', 'danger');
            return;
        }

        try {
            console.log('wordData:', wordData);
            // API 요청 전송
            const response = await fetch('/api/v1/words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wordData)
            });

            // 응답 데이터 파싱
            const data = await response.json();

            // 응답 처리
            if (response.ok) {
                // 성공 시: 토스트 페미시 표시 후 학습 페이지로 이동
                showToast('단어가 등록되었습니다.', 'success');
                setTimeout(() => {
                    window.location.href = '/word/study';
                }, 1000);
            } else {
                // 실패 시: 에러 메시지 표시
                const errorMessages = data.errors.join('\n');
                showToast(`등록 실패: ${errorMessages}`, 'danger');
            }

        } catch (error) {
            // 예외 발생 시: 콘솔에 에러 로깅 및 에러 메시지 표시
            console.error('Error:', error);
            showToast('오류가 발생했습니다.', 'danger');
        }
    });

    // 실시간 입력 유효성 검사
    // input 이벤트 (입력 중)와 blur 이벤트 (포커스 잃을 떄) 모두에게 검사
    const inputs = form.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            validateField(this);
        });

        // blur 이벤트 추가 (포커스를 잃었을 때)
        input.addEventListener('blur', function () {
            validateField(this);
        });
    });

    // 개별 필드 유효성 검사 함수
    function validateField(field) {
        if (field.checkValidity()) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
    }


    // 취소 버튼 클릭 이벤트 리스너
    cancelButton.addEventListener('click', async (e) => {
        e.preventDefault();
        history.back(); // 이전 페이지로 이동
        // window.location.href = '/word/study'; // 직접 경로 지정
    })

    // 토스트 메시지 표시 함수
    function showToast(message, type) {
        // 토스트 메시지 내용 설정
        toast.querySelector('.toast-body').textContent = message;
        // 이전 스타일 클래스 제거
        toast.classList.remove('bg-success', 'bg-danger');
        // 새로운 스타일 클래스 추가
        toast.classList.add(`bg-${type}`);
        // 토스트 메시지 표시
        bsToast.show();
    }

});