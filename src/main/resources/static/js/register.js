document.addEventListener('DOMContentLoaded', function () {
    // 폼과 토스트 요소 저장
    const form = document.getElementById('wordForm');
    const toast = document.getElementById('toast');
    const bsToast = new bootstrap.Toast(toast);
    const cancelButton = document.getElementById('cancelBtn');

    // 기본 제출 동작 방지
    form.addEventListener('submit', async (e) => {
        e.preventDefault();


        const wordData = {
            vocabulary: document.getElementById('vocabulary').value,
            meaning: document.getElementById('meaning').value,
            hint: document.getElementById('hint').value,
            difficulty: parseInt(document.getElementById('difficulty').value)
        };

        try {
            const response = await fetch('/api/v1/words/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wordData)
            });


            const data = await response.json();

            if (response.ok) {
                showToast('단어가 등록되었습니다.', 'success');
                setTimeout(() => {
                    window.location.href = '/word/study';
                }, 1000);
            } else {
                const errorMessages = data.errors.join('\n');
                showToast(`등록 실패: ${errorMessages}`, 'danger');
            }

        } catch (error) {
            console.error('Error:', error);
            showToast('오류가 발생했습니다.', 'danger');
        }
    });


    cancelButton.addEventListener('click', async (e) => {
        e.preventDefault();
        history.back();
        // window.location.href = '/word/study';
    })

    function showToast(message, type) {
        toast.querySelector('.toast-body').textContent = message;
        toast.classList.remove('bg-success', 'bg-danger');
        toast.classList.add(`bg-${type}`);
        bsToast.show();
    }

});