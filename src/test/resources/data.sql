INSERT INTO word_book (name, description, category, created_at, updated_at)
VALUES ('TOEIC 기초', '토익 기초 단어장', 'TOEIC', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

INSERT INTO english_word (vocabulary, meaning, hint, difficulty, created_at, updated_at, word_book_id)
VALUES ('apple', '사과', '빨간 과일', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), 1);