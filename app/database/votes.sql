DROP TABLE IF EXISTS Votes;

CREATE TABLE Votes (
    chatline_id varchar(50) NOT NULL,
    vote TINYINT(1) NOT NULL,
    userid VARCHAR(256) NOT NULL
    PRIMARY KEY (`chatline_id`),
    KEY `user_id` (`userid`),
    CONSTRAINT `chat_id_constraint` FOREIGN KEY(`chatline_id`) REFERENCES `ChatLines` (`line_id`) ON DELETE CASCADE,
    CONSTRAINT `user_id_constraint` FOREIGN KEY(`userid`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
