-- migrations/006_roadmap_edge_handles.sql
ALTER TABLE roadmap_edges
  ADD COLUMN source_handle TEXT,
  ADD COLUMN target_handle TEXT;