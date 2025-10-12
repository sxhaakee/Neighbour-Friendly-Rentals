-- ============================================
-- CREATE CHAT SYSTEM
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, user1_id, user2_id)
);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- 4. Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update their conversations"
ON conversations FOR UPDATE
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 6. RLS Policies for messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

-- 7. Function to update conversation's last_message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;

-- 8. Trigger to update conversation on new message
DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- 9. Function to get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_listing_id UUID,
  p_user1_id UUID,
  p_user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to find existing conversation (order doesn't matter)
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE listing_id = p_listing_id
  AND (
    (user1_id = p_user1_id AND user2_id = p_user2_id)
    OR
    (user1_id = p_user2_id AND user2_id = p_user1_id)
  )
  LIMIT 1;

  -- If not found, create new conversation
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (listing_id, user1_id, user2_id)
    VALUES (p_listing_id, p_user1_id, p_user2_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- 10. Grant permissions
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID, UUID) TO authenticated;

-- 11. Reload schema cache
NOTIFY pgrst, 'reload schema';

-- 12. Verify tables created
SELECT 
  'conversations table exists' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'conversations'
  ) THEN '✅ YES' ELSE '❌ NO' END as result
UNION ALL
SELECT 
  'messages table exists',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'messages'
  ) THEN '✅ YES' ELSE '❌ NO' END
UNION ALL
SELECT 
  'RLS policies count (conversations)',
  CAST(COUNT(*) AS TEXT) || ' policies'
FROM pg_policies WHERE tablename = 'conversations'
UNION ALL
SELECT 
  'RLS policies count (messages)',
  CAST(COUNT(*) AS TEXT) || ' policies'
FROM pg_policies WHERE tablename = 'messages';

-- Should show all ✅ YES
