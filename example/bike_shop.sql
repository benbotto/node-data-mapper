DROP DATABASE IF EXISTS bike_shop;
CREATE DATABASE bike_shop
  DEFAULT CHARACTER SET utf8
  DEFAULT COLLATE utf8_general_ci;
USE bike_shop;

GRANT ALL ON `bike_shop`.* TO 'example'@'%' IDENTIFIED BY 'secret';

-- Stores that sell bikes.
CREATE TABLE bike_shops
(
  bikeShopID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255)
);

INSERT INTO bike_shops(name, address) VALUES
('Bob\'s Bikes'         ,'9107 Sunrise Blvd'), 
('Zephyr Cove Cruisers' ,'18271 Highway 50'), 
('Cycle Works'          ,'3100 La Riviera Wy');


-- Staff members at the stores.
CREATE TABLE staff
(
  staffID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  age INT,
  sex VARCHAR(20),
  -- Note: intentionally not using BOOLEAN (a.k.a TINYINT(1)) for example purposes.
  hasStoreKeys BIT NOT NULL DEFAULT 0,
  hireDate DATE NOT NULL,
  bikeShopID INT NOT NULL,
  CONSTRAINT fk_staff_bikeShopID
    FOREIGN KEY (bikeShopID) REFERENCES bike_shops(bikeShopID)
    ON DELETE CASCADE
);

INSERT INTO staff (firstName, lastName, age, sex, hasStorekeys, hireDate, bikeShopID) VALUES
('Randy',    'Alamedo',     21, 'male',   0, '2012-01-03', 1),
('John',     'Stovall',     54, 'male',   1, '1999-08-14', 1),
('Tina',     'Beckenworth', 16, 'female', 0, '2006-04-30', 1),
('Abe',      'Django',      67, 'male',   1, '2015-09-19', 2),
('Sal',      'Green',       42, 'male',   1, '2004-01-30', 3),
('Valerie',  'Stocking',    29, 'female', 1, '2007-11-12', 3),
('Kimberly', 'Fenters',     18, 'female', 0, '2006-03-25', 3),
('Michael',  'Xavier',      22, 'male',   0, '2010-04-29', 3);


-- Staff members can receive bonuses.
CREATE TABLE bonuses
(
  bonusID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  reason TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  dateGiven DATE NOT NULL,
  staffID INT NOT NULL,
  CONSTRAINT fk_bonuses_staffID
    FOREIGN KEY (staffID) REFERENCES staff(staffID)
    ON DELETE CASCADE
);

INSERT INTO bonuses (reason, amount, dateGiven, staffID) VALUES
('Salesperson of the month.',      250, '2013-06-01', 1), 
('Most supportive team member.',   600, '2009-07-07', 6), 
('Outstanding mechanical skills.', 320, '2011-01-31', 8);

-- Bike shops with all staff, and the bonuses (if any) for each staff member.
SELECT  *
FROM    bike_shops bs
INNER JOIN staff s ON bs.bikeShopID = s.bikeShopID
LEFT OUTER JOIN bonuses b ON s.staffID = b.staffID;


-- Bikes with the suggested MSRP.
CREATE TABLE bikes
(
  bikeID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  msrp DECIMAL(10, 2)
);

INSERT INTO bikes (brand, model, msrp) VALUES
('Felt',        'F1',                6999),
('Felt',        'Z5',                1999),
('Specialized', 'Stump Jumber HT',   8500),
('Specialized', 'ERA Carbon 29',     6200),
('Stolen',      'Sinner Complete',   1850),
('Haro',        'SDV2',              1089.99),
('Haro',        'Leucadia DLX',      299.99),
('Firmstrong',  'Bella Fashionista', 309.99),
('Firmstrong',  'Black Rock',        299.99),
('Firmstrong',  'Bella Classic',     279.99);


-- The bike shop sells these bikes.
CREATE TABLE bike_shop_bikes
(
  bikeShopBikeID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  bikeShopID INT NOT NULL,
  bikeID INT NOT NULL,
  CONSTRAINT fk_bike_shop_bikes_bikeShopID FOREIGN KEY (bikeShopID) REFERENCES bike_shops(bikeShopID),
  CONSTRAINT fk_bike_shop_bikes_bikeID FOREIGN KEY (bikeID) REFERENCES bikes(bikeID),
  CONSTRAINT uc_bike_shop_bikes_bikeShopID_bikeID UNIQUE (bikeShopID, bikeID)
);

INSERT INTO bike_shop_bikes (bikeShopID, bikeID) VALUES
(1, 1),
(1, 2),
(1, 5),
(1, 6),
(1, 7),
(2, 3),
(2, 4),
(3, 6),
(3, 7),
(3, 8),
(3, 9),
(3, 10);

-- Bike shops with all the bikes sold by each.
SELECT  *
FROM    bike_shops bs
INNER JOIN bike_shop_bikes bsb ON bs.bikeShopID = bsb.bikeShopID
INNER JOIN bikes b ON bsb.bikeID = b.bikeID;

