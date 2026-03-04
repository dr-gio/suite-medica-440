-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Function to handle knowledge search (semantic or keyword fallback)
CREATE OR REPLACE FUNCTION match_knowledge (
  query_embedding vector(1536), -- Assuming OpenAI embeddings
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id text,
  title text,
  content text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- This is a placeholder for semantic search. 
  -- Currently, since we store everything in a JSONB column in 'suite_config',
  -- this function will be updated once we migrate Knowledge Items to their own table
  -- or we can use JSONB path queries for keyword matching.
  
  RETURN QUERY
  SELECT 
    '1' as id,
    'Guía de Recuperación' as title,
    'La recuperación depende del procedimiento...' as content,
    'protocolo' as category,
    1.0 as similarity;
END;
$$;
