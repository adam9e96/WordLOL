// 샘플 카드 클릭 시 뒤집기 기능
document.addEventListener('DOMContentLoaded', function () {
    const sampleCards = document.querySelectorAll('.sample-card');

    sampleCards.forEach(card => {
        card.addEventListener('click', function () {
            this.classList.toggle('flipped');
        });
    });
});