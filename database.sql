CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password TEXT,
    role VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    price NUMERIC,
    image TEXT
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    day VARCHAR(20),
    time VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active'
);


UPDATE users
SET role='admin'
WHERE email='brajan@gmail.com';


SELECT * FROM users;


INSERT INTO services(title, price, image)
VALUES ('Manicura básica', 20000, 'manicura.jpg');


SELECT * FROM appointments;

DELETE FROM appointments;

DELETE FROM appointments WHERE user_id IS NULL;

SELECT id,name,email,password,role FROM users;


-- Agregar columnas para reset de contraseña
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP;

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    document_type VARCHAR(20) DEFAULT 'CC',
    document_number VARCHAR(30) UNIQUE,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    rut_pdf TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);