-- Create custom ENUM types
CREATE TYPE user_type_enum AS ENUM ('individual', 'business', 'affiliate');
CREATE TYPE subscription_plan_enum AS ENUM ('basic', 'premium', 'enterprise');
CREATE TYPE product_category_enum AS ENUM ('clothing', 'hair', 'footwear', 'accessories');
CREATE TYPE event_type_enum AS ENUM ('try_on', 'click_through', 'purchase');
CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE content_type_enum AS ENUM ('product', 'tryon', 'comment');
CREATE TYPE content_type_enum_no_comment AS ENUM ('product', 'tryon');
CREATE TYPE report_status_enum AS ENUM ('pending', 'reviewed', 'actioned', 'dismissed');
CREATE TYPE social_provider_enum AS ENUM ('google', 'facebook', 'apple', 'twitter');


-- Users table (for both individual users and businesses/affiliates)
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type user_type_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles
CREATE TABLE UserProfiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    full_name VARCHAR(255),
    profile_picture_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business profiles
CREATE TABLE BusinessProfiles (
    business_profile_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url VARCHAR(255),
    subscription_plan subscription_plan_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE Products (
    product_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category product_category_enum NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product variations
CREATE TABLE ProductVariations (
    variation_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES Products(product_id),
    color VARCHAR(50),
    size VARCHAR(20),
    stock_quantity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Try-ons
CREATE TABLE TryOns (
    tryon_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    product_id INTEGER REFERENCES Products(product_id),
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social shares
CREATE TABLE SocialShares (
    share_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    tryon_id INTEGER REFERENCES TryOns(tryon_id),
    platform VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE Notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics
CREATE TABLE Analytics (
    analytics_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    product_id INTEGER REFERENCES Products(product_id),
    event_type event_type_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ecommerce orders (for Phase 2)
CREATE TABLE Orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status order_status_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items (for Phase 2)
CREATE TABLE OrderItems (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES Orders(order_id),
    product_id INTEGER REFERENCES Products(product_id),
    variation_id INTEGER REFERENCES ProductVariations(variation_id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Existing tables remain the same

-- Password Reset Tokens
CREATE TABLE PasswordResetTokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions
CREATE TABLE UserSessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Two-Factor Authentication
CREATE TABLE TwoFactorAuth (
    twofa_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    secret_key VARCHAR(255) NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes
CREATE TABLE Likes (
    like_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    content_type content_type_enum_no_comment NOT NULL,
    content_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
CREATE TABLE Comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    tryon_id INTEGER REFERENCES TryOns(tryon_id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Followers
CREATE TABLE Followers (
    follower_id INTEGER REFERENCES Users(user_id),
    followed_id INTEGER REFERENCES Users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id)
);

-- Content Reports
CREATE TABLE ContentReports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES Users(user_id),
    content_type content_type_enum NOT NULL,
    content_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status report_status_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags
CREATE TABLE Tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Tags (for both products and try-ons)
CREATE TABLE ContentTags (
    content_tag_id SERIAL PRIMARY KEY,
    tag_id INTEGER REFERENCES Tags(tag_id),
    content_type content_type_enum_no_comment NOT NULL,
    content_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search History
CREATE TABLE SearchHistory (
    search_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    query TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences
CREATE TABLE UserPreferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    notification_settings JSONB,
    privacy_settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Reviews
CREATE TABLE ProductReviews (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    product_id INTEGER REFERENCES Products(product_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Existing tables remain the same

-- Social Media Authentication
CREATE TABLE SocialAuth (
    social_auth_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(user_id),
    provider social_provider_enum NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- Add index for performance
CREATE INDEX idx_social_auth_user ON SocialAuth(user_id);
CREATE INDEX idx_tryon_user ON TryOns(user_id);
CREATE INDEX idx_tryon_product ON TryOns(product_id);
CREATE INDEX idx_likes_user ON Likes(user_id);
CREATE INDEX idx_likes_content ON Likes(content_type, content_id);
CREATE INDEX idx_comments_tryon ON Comments(tryon_id);
CREATE INDEX idx_followers_follower ON Followers(follower_id);
CREATE INDEX idx_followers_followed ON Followers(followed_id);
CREATE INDEX idx_content_tags_tag ON ContentTags(tag_id);
CREATE INDEX idx_content_tags_content ON ContentTags(content_type, content_id);
CREATE INDEX idx_search_history_user ON SearchHistory(user_id);
CREATE INDEX idx_product_reviews_product ON ProductReviews(product_id);

