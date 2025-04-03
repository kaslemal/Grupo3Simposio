-- Migración para agregar columnas adicionales a la tabla students
ALTER TABLE students
  ADD COLUMN verification_status VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (verification_status IN ('Pendiente', 'Verificado')),
  ADD COLUMN verification_comments TEXT,
  ADD COLUMN verified_by INT REFERENCES users(id),
  ADD COLUMN verified_at TIMESTAMP;
