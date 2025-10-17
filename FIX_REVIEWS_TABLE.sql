-- =====================================================
-- FIX REVIEWS TABLE - item_id column issue
-- =====================================================

-- Drop the existing reviews table if it has issues
DROP TABLE IF EXISTS review_helpful_votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

-- Recreate reviews table with correct column names
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  service_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[],
  verified_rental BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  reported BOOLEAN DEFAULT false,
  owner_response TEXT,
  owner_response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT review_target_check CHECK (
    (listing_id IS NOT NULL AND property_id IS NULL AND service_id IS NULL) OR
    (listing_id IS NULL AND property_id IS NOT NULL AND service_id IS NULL) OR
    (listing_id IS NULL AND property_id IS NULL AND service_id IS NOT NULL)
  )
);

-- Create review helpful votes table
CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Create indexes
CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_service_id ON reviews(service_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view helpful votes"
  ON review_helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote on reviews"
  ON review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their votes"
  ON review_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_helpful_count_trigger
AFTER INSERT OR DELETE ON review_helpful_votes
FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Grant permissions
GRANT ALL ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT ALL ON review_helpful_votes TO authenticated;
GRANT SELECT ON review_helpful_votes TO anon;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Reviews table fixed with listing_id column';
END $$;
