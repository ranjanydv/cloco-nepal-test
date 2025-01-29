CREATE TYPE user_role AS ENUM ('super_admin', 'artist_manager', 'artist');
CREATE TYPE gender_enum AS ENUM ('m', 'f', 'o');
CREATE TYPE genre_enum AS ENUM ('mb', 'country', 'classic', 'rock', 'jazz');

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
  gender gender_enum NOT NULL,
  address VARCHAR(255) NOT NULL,
  first_release_year INT NOT NULL,
  no_of_albums_released INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manager_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_artist_user UNIQUE (user_id),
  CONSTRAINT unique_artist_manager (manager_id)
);

CREATE TABLE music (
  id SERIAL PRIMARY KEY,
  artist_id INT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  album_name VARCHAR(255) NOT NULL,
  genre genre_enum NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);