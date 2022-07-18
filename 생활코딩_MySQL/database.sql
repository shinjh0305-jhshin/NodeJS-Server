CREATE DATABASE		OPENTUTORIALS;
CREATE USER	'nodejs'@'%' IDENTIFIED BY '/*user password 기입*/';
GRANT ALL PRIVILEGES ON OPENTUTORIALS.* TO 'nodejs'@'%';
ALTER USER 'nodejs'@'%' IDENTIFIED WITH mysql_native_password BY '/*user password 기입*/';
FLUSH PRIVILEGES;

CREATE TABLE AUTHOR (
	ID 		INT		NOT NULL	AUTO_INCREMENT		PRIMARY KEY,
    NAME	VARCHAR(10),
    PROFILE	VARCHAR(200)	DEFAULT NULL
);

INSERT INTO	AUTHOR VALUES (1, 'SHIN', 'SOGANG');
INSERT INTO AUTHOR VALUES (2, 'JAEHYUN', 'INCHEON');
INSERT INTO AUTHOR VALUES (3, 'SSG', 'LANDERS');

CREATE TABLE TOPIC (
	ID			INT			NOT NULL	AUTO_INCREMENT		PRIMARY KEY,
    TITLE		VARCHAR(30) NOT NULL,
    DESCRIPTION	TEXT,
    CREATED		DATETIME	NOT NULL,
    AUTHOR_ID	INT			DEFAULT NULL    
);

INSERT INTO TOPIC VALUES (1, 'MySQL', 'MySQL is....', '2018-01-01 12:10:11', 1);
INSERT INTO TOPIC VALUES (2, 'Oracle', 'Oracle is....', '2018-01-03 13:01:10', 1);
INSERT INTO TOPIC VALUES (3, 'SQL Server', 'SQL Server is....', '2018-01-20 11:01:10', 2);
INSERT INTO TOPIC VALUES (4, 'PostgreSQL', 'PostgreSQL is....', '2018-01-23 01:03:03', 3);
INSERT INTO TOPIC VALUES (5, 'MongoDB', 'MongoDB is....', '2018-01-30 12:31:03', 1);

/*
show variables where variable_name='hostname';
select user();	
select host, user from mysql.user;
*/