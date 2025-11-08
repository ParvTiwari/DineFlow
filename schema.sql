CREATE DATABASE IF NOT EXISTS dineflow;

USE dineflow;

CREATE TABLE user(
	user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    phone CHAR(10) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu(
	item_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    dishimage VARCHAR(255), 
    description TEXT,
    price DECIMAL,
    category VARCHAR(50)
);
CREATE TABLE tables(
	id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT NOT NULL UNIQUE,
    booking_time DATETIME,
    is_available BOOLEAN DEFAULT TRUE
);
CREATE TABLE cart(
	id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    menu_id INT,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (menu_id) REFERENCES menu(item_id)
);
CREATE TABLE orders(
	order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    table_id INT,
    total_amount DECIMAL(10, 2),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) references user(user_id),
    FOREIGN KEY (table_id) references tables(id)
);

CREATE TABLE order_items(
	order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    menu_id INT,
    quantity INT,
    price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menu(item_id)
);

CREATE TABLE payments(
	payment_id INT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    status ENUM ('success', 'failed', 'pending') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE TABLE reviews(
	review_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    number CHAR(10) NOT NULL,
    comment TEXT NOT NULL,
    review_date TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE about (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL
);
SHOW TABLES;
SELECT * FROM user;
SET SQL_SAFE_UPDATES = 0;
DROP table user;
DELETE FROM user WHERE name="Parv";

INSERT INTO menu (name, dishimage, description, price, category) VALUES
-- Appetizers
('Tomato Soup', 'tomato soup.jpg', 'A rich and velvety soup made with ripe, fresh tomatoes, seasoned with a blend of aromatic herbs and spices. Ideal as a starter or a light meal.', 250, 'Appetizer'),
('Manchow Soup', 'manchow soup.jpeg', 'A flavorful and spicy Indo-Chinese soup made with a medley of finely chopped vegetables, crisp noodles, and a hint of tangy soy sauce.', 250, 'Appetizer'),
('Garlic Bread', 'garlic-bread.jpg', 'Crispy toasted bread topped with a savory garlic butter spread.', 180, 'Appetizer'),
('Paneer 65', 'paneer 65.jpg', 'Crispy fried cottage cheese tempered with curry leaves and chilly.', 425, 'Appetizer'),
('Paneer Tikka', 'paneer tikka.jpg', 'A flavorful Indian appetizer, marinated cubes of paneer are spiced with a blend of yogurt, herbs, and aromatic spices, then grilled to perfection.', 450, 'Appetizer'),
('Manchurian', 'manchurian.webp', 'Delicious, crispy vegetable dumplings made with a mix of finely chopped vegetables.', 440, 'Appetizer'),

-- Main Course
('Paneer Butter Masala', 'paneer butter masala.jpg', 'A rich and creamy North Indian classic, this dish features soft cubes of paneer simmered in a velvety tomato-based gravy.', 475, 'Main Course'),
('Kadhai Paneer', 'kadai paneer.jpg', 'Cottage cheese and assorted bell pepper simmered with cashew tomato gravy.', 465, 'Main Course'),
('Dal Tadka', 'dal tadka.webp', 'Classic blend of two lentils, tempered garlic and chilies.', 465, 'Main Course'),
('Shish Ranga Dum Biryani', 'veg biryani.jpeg', 'Vegetables biryani cooked in Hyderabad style.', 525, 'Main Course'),
('Steam Rice / Jeera Dhaniya Pulao', 'steam rice.jpg', 'Fluffy, perfectly cooked basmati rice, steamed to perfection.', 300, 'Main Course'),
('Plain Naan / Butter Naan', 'naan.jpg', 'A soft, warm, and fluffy Indian flatbread, baked in a traditional tandoor oven. Lightly charred on the outside and tender on the inside.', 60, 'Main Course'),
('Plain Laccha Paratha / Butter Laccha Paratha', 'lachcha paratha.webp', 'A crispy, flaky, and soft Indian flatbread made by folding layers of dough and then cooking it on a hot griddle.', 60, 'Main Course'),
('Tandoori Roti', 'tandoori roti.jpg', 'A traditional Indian flatbread made from whole wheat flour, baked to perfection in a tandoor (clay oven).', 40, 'Main Course'),
('Kulcha', 'kulcha.jpg', 'A soft, fluffy Indian flatbread, traditionally stuffed with ingredients like potato, paneer, or a variety of spices, and baked in a tandoor.', 60, 'Main Course'),

-- Desserts
('Gulab Jamun', 'gulab jamun.webp', 'Soft spong Gulab Jamun drenched in sugar syrup.', 200, 'Dessert'),
('Sheer Khurma', 'sheer khurma.jpg', 'A dessert made with vermicelli and a blend of aromatic spices like cardamom and saffron.', 270, 'Dessert'),
('Kesari Rasmalai', 'rasmalai.jpg', 'Juicy cottage cheese discs served with thickened milk.', 275, 'Dessert'),
('Kulfi', 'kulfi.jpg', 'A creamy, traditional Indian ice cream made with reduced milk, sugar, and fragrant spices like cardamom and saffron.', 250, 'Dessert'),
('Brownie', 'brownie.jpeg', 'A dense, fudgy dessert with a rich chocolate flavor, made from butter, sugar, flour, and cocoa powder.', 240, 'Dessert');

INSERT INTO about (title, description, image) VALUES
('We are DineFlow', 'A smart and dynamic restaurant management system. Seamless ordering, efficient operations, and enhanced dining experiences.', 'dine.jpg'),
('Innovation in Dining', 'We revolutionize restaurant management with cutting-edge technology, ensuring smooth service, real-time analytics, and customer satisfaction.', 'innovation.jpg'),
('Empowering Restaurants', 'From digital menus and automated order management to real-time analytics and seamless payments, we help restaurants optimize operations and enhance guest experiences. DineFlow ensures everything flows effortlessly.', 'empowering_restaurants.webp'),
('Shaping the Future of Dining', 'With a commitment to efficiency and innovation, we\'re redefining how restaurants operate—where technology meets taste, and every meal is a delightful experience. We empower restaurants to deliver exceptional service.', 'future.jpg');
