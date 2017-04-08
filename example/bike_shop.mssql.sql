USE master;
GO;

-- Drop and recreate the database.
IF EXISTS (
  SELECT  database_id
  FROM    sys.databases
  WHERE   name = 'bike_shop'
)
  DROP DATABASE bike_shop;

CREATE DATABASE bike_shop;
GO;

-- Create an "example" login with password "secret".
IF NOT EXISTS (
  SELECT  *
  FROM    master.dbo.syslogins 
  WHERE   name = 'example'
)
  CREATE LOGIN [example] WITH PASSWORD = 'secret';

USE bike_shop;
GO;

-- Add the "example" user.  It needs permission to read, write, and to
-- view the INFORMATION_SCHEMA tables.
CREATE USER [example] FOR LOGIN [example];
EXEC sp_addrolemember 'db_datareader', 'example';
EXEC sp_addrolemember 'db_datawriter', 'example';
GRANT VIEW DEFINITION TO [example];
GO;

-- Stores that sell bikes.
CREATE TABLE bike_shops
(
  bikeShopID INT NOT NULL PRIMARY KEY IDENTITY,
  name NVARCHAR(255) NOT NULL,
  address NVARCHAR(255)
);
GO;

INSERT INTO bike_shops(name, address) VALUES
('Bob''s Bikes'         ,'9107 Sunrise Blvd'); 
INSERT INTO bike_shops(name, address) VALUES
('Zephyr Cove Cruisers' ,'18271 Highway 50'); 
INSERT INTO bike_shops(name, address) VALUES
('Cycle Works'          ,'3100 La Riviera Wy');


-- Staff members at the stores.
CREATE TABLE staff
(
  staffID INT NOT NULL PRIMARY KEY IDENTITY,
  firstName NVARCHAR(255) NOT NULL,
  lastName NVARCHAR(255) NOT NULL,
  age INT,
  sex NVARCHAR(20),
  hasStoreKeys BIT NOT NULL DEFAULT 0,
  hireDate DATETIME NOT NULL,
  bikeShopID INT NOT NULL,
  CONSTRAINT fk_staff_bikeShopID
    FOREIGN KEY (bikeShopID) REFERENCES bike_shops(bikeShopID)
    ON DELETE CASCADE
);
GO;

INSERT INTO staff (firstName, lastName, age, sex, hasStorekeys, hireDate, bikeShopID) VALUES
('Randy',    'Alamedo',     21, 'male',   0, '2012-01-03', 1);
INSERT INTO staff (firstName, lastName, age, sex, hasStorekeys, hireDate, bikeShopID) VALUES
('John',     'Stovall',     54, 'male',   1, '1999-08-14', 1);
INSERT INTO staff (firstName, lastName, age, sex, hasStorekeys, hireDate, bikeShopID) VALUES
('Tina',     'Beckenworth', 16, 'female', 0, '2006-04-30', 1);
INSERT INTO staff (firstName, lastName, age, sex, hasStorekeys, hireDate, bikeShopID) VALUES
('Abe',      'Django',      67, 'male',   1, '2015-09-19', 2);
INSERT INTO staff (firstName, lastName, age, sex, hasStorekeys, hireDate, bikeShopID) VALUES
('Sal',      'Green',       42, 'male',   1, '2004-01-30', 3);
INSERT INTO staff (firstName, lastName, age, sex, hasStorekeys, hireDate, bikeShopID) VALUES
('Valerie',  'Stocking',    29, 'female', 1, '2007-11-12', 3);
INSERT INTO staff (firstName, lastName, age, sex, hasStorekeys, hireDate, bikeShopID) VALUES
('Kimberly', 'Fenters',     18, 'female', 0, '2006-03-25', 3);
INSERT INTO staff (firstName, lastName, age, sex, hasStorekeys, hireDate, bikeShopID) VALUES
('Michael',  'Xavier',      22, 'male',   0, '2010-04-29', 3);


-- Staff members can receive bonuses.
CREATE TABLE bonuses
(
  bonusID INT NOT NULL PRIMARY KEY IDENTITY,
  reason TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  dateGiven DATETIME NOT NULL,
  staffID INT NOT NULL,
  CONSTRAINT fk_bonuses_staffID
    FOREIGN KEY (staffID) REFERENCES staff(staffID)
    ON DELETE CASCADE
);
GO;

INSERT INTO bonuses (reason, amount, dateGiven, staffID) VALUES
('Salesperson of the month.',      250, '2013-06-01', 1);
INSERT INTO bonuses (reason, amount, dateGiven, staffID) VALUES
('Most supportive team member.',   600, '2009-07-07', 6);
INSERT INTO bonuses (reason, amount, dateGiven, staffID) VALUES
('Outstanding mechanical skills.', 320, '2011-01-31', 8);

-- Bike shops with all staff, and the bonuses (if any) for each staff member.
SELECT  *
FROM    bike_shops bs
INNER JOIN staff s ON bs.bikeShopID = s.bikeShopID
LEFT OUTER JOIN bonuses b ON s.staffID = b.staffID;


-- Bikes with the suggested MSRP.
CREATE TABLE bikes
(
  bikeID INT NOT NULL PRIMARY KEY IDENTITY,
  brand NVARCHAR(255) NOT NULL,
  model NVARCHAR(255) NOT NULL,
  msrp DECIMAL(19, 4)
);
GO;

INSERT INTO bikes (brand, model, msrp) VALUES
('Felt',        'F1',                6999);
INSERT INTO bikes (brand, model, msrp) VALUES
('Felt',        'Z5',                1999);
INSERT INTO bikes (brand, model, msrp) VALUES
('Specialized', 'Stump Jumber HT',   8500);
INSERT INTO bikes (brand, model, msrp) VALUES
('Specialized', 'ERA Carbon 29',     6200);
INSERT INTO bikes (brand, model, msrp) VALUES
('Stolen',      'Sinner Complete',   1850);
INSERT INTO bikes (brand, model, msrp) VALUES
('Haro',        'SDV2',              1089.99);
INSERT INTO bikes (brand, model, msrp) VALUES
('Haro',        'Leucadia DLX',      299.99);
INSERT INTO bikes (brand, model, msrp) VALUES
('Firmstrong',  'Bella Fashionista', 309.99);
INSERT INTO bikes (brand, model, msrp) VALUES
('Firmstrong',  'Black Rock',        299.99);
INSERT INTO bikes (brand, model, msrp) VALUES
('Firmstrong',  'Bella Classic',     279.99);


-- The bike shop sells these bikes.
CREATE TABLE bike_shop_bikes
(
  bikeShopBikeID INT NOT NULL PRIMARY KEY IDENTITY,
  bikeShopID INT NOT NULL,
  bikeID INT NOT NULL,
  CONSTRAINT fk_bike_shop_bikes_bikeShopID FOREIGN KEY (bikeShopID) REFERENCES bike_shops(bikeShopID),
  CONSTRAINT fk_bike_shop_bikes_bikeID FOREIGN KEY (bikeID) REFERENCES bikes(bikeID),
  CONSTRAINT uc_bike_shop_bikes_bikeShopID_bikeID UNIQUE (bikeShopID, bikeID)
);
GO;

INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (1, 1);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (1, 2);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (1, 5);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (1, 6);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (1, 7);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (2, 3);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (2, 4);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (3, 6);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (3, 7);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (3, 8);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (3, 9);
INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES (3, 10);

-- Bike shops with all the bikes sold by each.
SELECT  *
FROM    bike_shops bs
INNER JOIN bike_shop_bikes bsb ON bs.bikeShopID = bsb.bikeShopID
INNER JOIN bikes b ON bsb.bikeID = b.bikeID;

