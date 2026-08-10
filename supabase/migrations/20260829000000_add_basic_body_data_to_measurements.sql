-- Sprint M — Basic Body Data (Measurement Foundation)
-- Per-record body-condition snapshot on `measurements`, captured alongside
-- the manual measurement (which stays the single source of truth for
-- garment sizing). Reference-only for Pattern Formulation and the future
-- LTOS-W4 Digital Body Profile — never used in any sizing/estimation
-- formula, and never overwrites a customer's global profile.
alter table public.measurements
  add column height_cm integer,
  add column weight_kg numeric(5, 2),
  add column age_years integer;
