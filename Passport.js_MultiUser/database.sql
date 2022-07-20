CREATE TABLE USERS (
	ID 				VARCHAR(20)		NOT NULL	PRIMARY KEY,
    PASSWORD 		BLOB			NOT NULL,
    EMAIL			VARCHAR(50)		NOT NULL,
    SALT			BLOB			NOT NULL,
    DISPLAYNAME		VARCHAR(200)	DEFAULT NULL
);

CREATE TABLE TOPICS (
	ID			VARCHAR(20)		NOT NULL	PRIMARY KEY,
    TITLE		VARCHAR(30) 	NOT NULL,
    DESCRIPTION	TEXT,
    CREATED		DATETIME		NOT NULL,
    USER_ID		VARCHAR(20)		NOT NULL   
);