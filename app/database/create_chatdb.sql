/* 
    This file correctly sets up databases (or at least runs without errors)
    TODO test triggers 
*/

DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Chat;
DROP TABLE IF EXISTS ChatLines;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS MemberOf;

DROP TRIGGER IF EXISTS DeleteNotification;
DROP TRIGGER IF EXISTS AddNotification;
DROP TRIGGER IF EXISTS MemberCheck;

CREATE TABLE User (
    id VARCHAR(256) NOT NULL UNIQUE PRIMARY KEY,
    username VARCHAR(256) NOT NULL,
    password VARCHAR(256) NOT NULL,
    first VARCHAR(256) NOT NULL,
    last VARCHAR(256) NOT NULL
);

CREATE TABLE Chat (
    id VARCHAR(256) NOT NULL UNIQUE PRIMARY KEY,
    chat_name VARCHAR(256) NOT NULL,
    stamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE ChatLines (
    chat_id VARCHAR(256) NOT NULL REFERENCES Chat(id) ON DELETE CASCADE,
    username VARCHAR(256) NOT NULL REFERENCES User(username) ON DELETE CASCADE,
    text VARCHAR(8192) NOT NULL,
    stamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    line_id BIGINT(20) NOT NULL AUTO_INCREMENT PRIMARY KEY
);


CREATE TABLE Notifications (
    chat_id VARCHAR(256) NOT NULL REFERENCES Chat(id) ON DELETE CASCADE,
    username VARCHAR(256) NOT NULL REFERENCES User(id) ON DELETE CASCADE,
    num_notifications INTEGER NOT NULL,
    PRIMARY KEY(chat_id, username)
);

CREATE TABLE MemberOf (
    chat_id VARCHAR(256) NOT NULL REFERENCES Chat(id) ON DELETE CASCADE,
    username VARCHAR(256) NOT NULL REFERENCES User(username) ON DELETE CASCADE,
    PRIMARY KEY(chat_id, username)
);

DELIMITER $$ 
/* Check if client is part of chat before sending message */
CREATE TRIGGER MemberCheck BEFORE INSERT ON ChatLines
FOR EACH ROW
    BEGIN
        IF (SELECT COUNT(*) FROM MemberOf WHERE MemberOf.chat_id = NEW.chat_id AND MemberOf.username = NEW.username) < 1 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Member is not part of requested chat';
        END IF;
    END;
$$

DELIMITER ;

DELIMITER $$
/* Upon removing client from chat, remove all related notifications */
CREATE TRIGGER DeleteNotification AFTER DELETE ON MemberOf
FOR EACH ROW
    BEGIN
        DELETE FROM Notifications WHERE OLD.chat_id = Notifications.chat_id AND OLD.username = Notifications.username;
    END;
$$
DELIMITER ;

DELIMITER $$
/* Upon adding client to chat, initialize notification row (0 notifications) */
CREATE TRIGGER AddNotification AFTER INSERT ON MemberOf
FOR EACH ROW
    BEGIN
        INSERT INTO Notifications (chat_id, username, num_notifications) VALUES (NEW.chat_id, NEW.username, 0);
    END;
$$
DELIMITER ;
