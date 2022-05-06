USE cookoliv;

DROP TABLE IF EXISTS roleUserLink;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS restaurants;

CREATE TABLE users (
  userID int(10) NOT NULL AUTO_INCREMENT,
  username varchar(15) NOT NULL,
  password varchar(256) NOT NULL,
  firstName varchar(20) NOT NULL,
  lastName varchar(20) NOT NULL,
  authToken varchar(128) NULL,
  PRIMARY KEY (userID)
);

CREATE TABLE roles (
  roleID int(10) NOT NULL AUTO_INCREMENT,
  role varchar(20) NOT NULL,
  PRIMARY KEY (roleID)
);

CREATE TABLE restaurants (
  restaurantID int(10) NOT NULL AUTO_INCREMENT,
  restaurantName varchar(50) NOT NULL,
  PRIMARY KEY (restaurantID)
);

CREATE TABLE roleUserLink (
  userID int(10) NOT NULL,
  roleID int(10) NOT NULL,
  restaurantID int(10) NULL,
  PRIMARY KEY (userID, roleID),
  CONSTRAINT fkLinkUserID FOREIGN KEY (userID) REFERENCES users (userID) ON DELETE CASCADE,
  CONSTRAINT fkLinkRoleID FOREIGN KEY (roleID) REFERENCES roles (roleID) ON DELETE CASCADE,
  CONSTRAINT fkLinkRestaurantID FOREIGN KEY (restaurantID) REFERENCES restaurants (restaurantID) ON DELETE CASCADE
);

CREATE TABLE items (
  itemID int(10) NOT NULL AUTO_INCREMENT,
  itemName varchar(50) NOT NULL,
  price decimal(5, 2) NOT NULL,
  calories int(5) NOT NULL,
  category varchar(20) NOT NULL,
  restaurantID int(10) NOT NULL,
  PRIMARY KEY (itemID),
  CONSTRAINT fkItemRestaurantID FOREIGN KEY (restaurantID) REFERENCES restaurants (restaurantID) ON DELETE CASCADE
);

CREATE TABLE orders (
  orderID int(10) NOT NULL AUTO_INCREMENT,
  tableNumber int(5) NOT NULL,
  userID int(10) NOT NULL,
  restaurantID int(10) NOT NULL,
  itemID int(10) NOT NULL,
  quantity int(10) NOT NULL,
  PRIMARY KEY (orderID),
  CONSTRAINT fkOrderUserID FOREIGN KEY (userID) REFERENCES users (userID) ON DELETE CASCADE,
  CONSTRAINT fkOrderRestaurantID FOREIGN KEY (restaurantID) REFERENCES restaurants (restaurantID) ON DELETE CASCADE,
  CONSTRAINT fkOrderItemID FOREIGN KEY (itemID) REFERENCES items (itemID) ON DELETE CASCADE
);

INSERT INTO roles (role) VALUES ("Customer");
INSERT INTO roles (role) VALUES ("Waiter");
INSERT INTO roles (role) VALUES ("Kitchen");
INSERT INTO roles (role) VALUES ("Manager");
INSERT INTO roles (role) VALUES ("Admin");

INSERT INTO users (username, password, firstName, lastName) VALUES ("admin", "5f4dcc3b5aa765d61d8327deb882cf99", "Oliver", "Cook");
INSERT INTO roleUserLink (userID, roleID) VALUES (1, 5)
