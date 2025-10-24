import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Connect to Neon / PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Neon
  },
});

const createTables = async () => {
  try {
    console.log('🟢 Connecting to database...');
    const client = await pool.connect();

    // SQL schema for your tables
    const schema = `
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      apify_id TEXT,
      image_url TEXT NOT NULL,
      caption TEXT,
      hashtags TEXT[],
      tags TEXT[],
      likes INTEGER,
      comments INTEGER,
      posted_at TIMESTAMP,
      user_handle TEXT,
      user_name TEXT,
      source_url TEXT,
      local_path TEXT,
      created_at date
    );

    CREATE TABLE IF NOT EXISTS detections (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      type VARCHAR(100),
      x double precision,
      y double precision,
      width double precision,
      height double precision,
      confidence double precision,
      crop_path TEXT,
      phash VARCHAR(100),
      created_at date,
      clip_embedding double precision[]
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku_id VARCHAR(100) UNIQUE,
      title TEXT,
      brand_name TEXT,
      category TEXT,
      featured_image TEXT,
      lowest_price NUMERIC(10,2),
      local_path TEXT,
      phash VARCHAR(64),
      created_at date,
      slug TEXT,
      sub_category TEXT,
      product_type TEXT,
      gender TEXT,
      colorways TEXT,
      brand_sku TEXT,
      model TEXT,
      description TEXT,
      is_d2c BOOLEAN,
      is_active BOOLEAN,
      is_certificate_required BOOLEAN,
      quantity_left INTEGER,
      wishlist_num INTEGER,
      stock_claimed_percent NUMERIC(5,2),
      discount_percentage NUMERIC(5,2),
      note TEXT,
      tags TEXT,
      release_date date,
      updated_at date,
      pdp_url TEXT,
      clip_embedding double precision[]
    );
    `;

    // Run the schema
    await client.query(schema);
    client.release();
    console.log('✅ Tables created successfully!');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  } finally {
    pool.end();
  }
};

// Run if executed directly (node db/initTables.js)
if (process.argv[1].endsWith('initTables.js')) {
  createTables();
}

export default createTables;
