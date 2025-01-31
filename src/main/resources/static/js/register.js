document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('wordForm');
    const toast = document.getElementById('toast');
    const bsToast = new bootstrap.Toast(toast);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

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
                }, 2000);
            } else {
                const errorMessages = data.errors.join('\n');
                showToast(`등록 실패: ${errorMessages}`, 'danger');
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