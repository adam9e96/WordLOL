CREATE TABLE IF NOT EXISTS word_book
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category    VARCHAR(20)  NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE IF NOT EXISTS english_word
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    vocabulary   VARCHAR(100) NOT NULL,
    meaning      VARCHAR(100) NOT NULL,
    hint         VARCHAR(100),
    difficulty   INT       DEFAULT 1,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    word_book_id BIGINT,
    CONSTRAINT fk_word_book FOREIGN KEY (word_book_id)
        REFERENCES word_book (id) ON DELETE SET NULL
);