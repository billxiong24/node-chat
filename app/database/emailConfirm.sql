DROP TABLE IF EXISTS EmailConfirm;

CREATE TABLE EmailConfirm (
    hash VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    confirmed BOOLEAN NOT NULL DEFAULT 0,
    CONSTRAINT `email_userid` FOREIGN KEY (`username`) REFERENCES `User` (`username`) ON DELETE CASCADE
);
