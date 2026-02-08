CREATE TABLE users (    
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(30) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 5000.00
);

CREATE TABLE categories (
    cat_id SERIAL PRIMARY KEY,
    cat_name VARCHAR(100) NOT NULL
);
CREATE TABLE products (
    prod_id SERIAL PRIMARY KEY,
    prod_name VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    image_url VARCHAR(255) NOT NULL UNIQUE,
    cat_id INT NOT NULL,
    FOREIGN KEY (cat_id) REFERENCES categories(cat_id)
);

create table cart (
    user_id INT NOT NULL,
    prod_id INT NOT NULL,
    cart_quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (prod_id) REFERENCES products(prod_id),
    UNIQUE (user_id, prod_id)
);


