document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('wordForm');
    const toast = document.getElementById('toast');
    const bsToast = new bootstrap.Toast(toast);

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // 기본 폼 제출 동작을 막습니다.

        if (!form.checkValidity()) { // 폼 유효성 검사
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        // 단어 데이터를 수집
        const wordData = {
            vocabulary: document.getElementById('vocabulary').value,
            meaning: document.getElementById('meaning').value,
            hint: document.getElementById('hint').value
        };
        
        // API 요청
        try {
            const response = await fetch('/api/v1/words/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wordData)
            });

            if (response.ok) {
                showToast('단어가 등록되었습니다.', 'success');
                setTimeout(() => {
                    window.location.href = '/word/study';
                }, 2000);
            } else {
                showToast('단어 등록에 실패했습니다.', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('오류가 발생했습니다.', 'danger');
        }
    });

    function showToast(message, type) {
        toast.querySelector('.toast-body').textContent = message;
        toast.classList.remove('bg-success', 'bg-danger');
        toast.classList.add(`bg-${type}`);
        bsToast.show();
    }
});