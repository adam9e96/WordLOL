INSERT INTO word_book (name, description, category, created_at, updated_at)
VALUES ('Test Book', 'Test Description', 'TOEIC', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

INSERT INTO english_word (vocabulary, meaning, hint, difficulty, created_at, updated_at)
VALUES ('apple', '사과', '동그랗고 빨간 과일', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
       ('banana', '바나나', '길쭉하고 노란 과일', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
       ('student', '학생, 학도, 공부하는 사람', '학교에 다니는 사람', 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());