CREATE TYPE user_role AS ENUM ('super_admin', 'artist_manager', 'artist');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(500) NOT NULL,
  role user_role NOT NULL, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(1) NOT NULL CHECK (gender IN ('m', 'f', 'o')),
  address VARCHAR(255) NOT NULL,
  first_release_year INT NOT NULL,
  no_of_albums_released INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE music (
  id SERIAL PRIMARY KEY,
  artist_id INT REFERENCES artists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  album_name VARCHAR(255) NOT NULL,
  genre VARCHAR(50) NOT NULL CHECK (genre IN ('mb', 'country', 'classic', 'rock', 'jazz')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);