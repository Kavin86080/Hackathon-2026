-- ==============================================================
-- ExplainGrade AI - MySQL Database DDL Schema
-- Problem Statement ID: WO-097
-- "From Marks to Meaningful Learning"
-- ==============================================================

CREATE DATABASE IF NOT EXISTS explaingrade_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE explaingrade_ai;

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('faculty', 'student') NOT NULL DEFAULT 'student',
  title VARCHAR(255),
  department VARCHAR(255),
  student_id VARCHAR(64),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(64) PRIMARY KEY,
  course_code VARCHAR(32) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  target_exam VARCHAR(255) NOT NULL,
  qid VARCHAR(64) NOT NULL,
  prompt TEXT NOT NULL,
  max_marks DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  modality VARCHAR(64) DEFAULT 'Long Descriptive',
  semantic_precision VARCHAR(128) DEFAULT 'Strict Semantic',
  knowledge_corpus TEXT,
  expected_answer MEDIUMTEXT,
  key_concepts JSON,
  learning_objectives JSON,
  status ENUM('draft', 'active', 'archived') DEFAULT 'active',
  created_by VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. RUBRICS
CREATE TABLE IF NOT EXISTS rubrics (
  id VARCHAR(64) PRIMARY KEY,
  question_id VARCHAR(64) UNIQUE NOT NULL,
  total_marks DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  is_locked BOOLEAN DEFAULT FALSE,
  model VARCHAR(128) DEFAULT 'Gemini-3.8-Flash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 4. RUBRIC CRITERIA
CREATE TABLE IF NOT EXISTS rubric_criteria (
  id VARCHAR(64) PRIMARY KEY,
  rubric_id VARCHAR(64) NOT NULL,
  criterion_order INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  weight_pct INT NOT NULL,
  max_marks DECIMAL(5,2) NOT NULL,
  target_semantic_anchors JSON,
  deduction_rules TEXT,
  scoring_ladder JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rubric_id) REFERENCES rubrics(id) ON DELETE CASCADE
);

-- 5. COURSE DOCUMENTS (RAG KNOWLEDGE BASE)
CREATE TABLE IF NOT EXISTS course_documents (
  id VARCHAR(64) PRIMARY KEY,
  faculty_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(128) NOT NULL,
  topic VARCHAR(128) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(64) NOT NULL,
  file_size BIGINT NOT NULL,
  content MEDIUMTEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. DOCUMENT CHUNKS (VECTOR STORAGE)
CREATE TABLE IF NOT EXISTS document_chunks (
  id VARCHAR(64) PRIMARY KEY,
  document_id VARCHAR(64) NOT NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  keywords JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES course_documents(id) ON DELETE CASCADE
);

-- 7. STUDENT ANSWERS
CREATE TABLE IF NOT EXISTS student_answers (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  question_id VARCHAR(64) NOT NULL,
  answer_text MEDIUMTEXT NOT NULL,
  word_count INT DEFAULT 0,
  status ENUM('NOT_STARTED', 'DRAFT', 'SUBMITTED', 'EVALUATING', 'EVALUATED', 'FEEDBACK_AVAILABLE') NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_submission (student_id, question_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 8. EVALUATIONS (DETERMINISTIC + AI SYNTHESIS)
CREATE TABLE IF NOT EXISTS evaluations (
  id VARCHAR(64) PRIMARY KEY,
  answer_id VARCHAR(64) UNIQUE NOT NULL,
  question_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  ai_recommended_score DECIMAL(5,2) NOT NULL,
  faculty_final_score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  confidence_pct INT NOT NULL DEFAULT 94,
  loss_deviation DECIMAL(4,2) NOT NULL DEFAULT 0.15,
  status ENUM('PENDING_REVIEW', 'APPROVED', 'MODIFIED') DEFAULT 'PENDING_REVIEW',
  faculty_notes TEXT,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP NULL,
  audit_hash VARCHAR(128),
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (answer_id) REFERENCES student_answers(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. CRITERION RESULTS (EVIDENCE GROUNDING)
CREATE TABLE IF NOT EXISTS criterion_results (
  id VARCHAR(64) PRIMARY KEY,
  evaluation_id VARCHAR(64) NOT NULL,
  criterion_id VARCHAR(64) NOT NULL,
  criterion_name VARCHAR(255) NOT NULL,
  criterion_order INT NOT NULL,
  max_marks DECIMAL(5,2) NOT NULL,
  awarded_marks DECIMAL(5,2) NOT NULL,
  status ENUM('FULL', 'PARTIAL', 'MISSING', 'ERROR') NOT NULL,
  sem_sim DECIMAL(4,2) DEFAULT 0.85,
  evidence TEXT,
  rationale TEXT,
  missing_concepts JSON,
  conceptual_errors JSON,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
);

-- 10. FEEDBACK & WHY MARKS WERE LOST
CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(64) PRIMARY KEY,
  evaluation_id VARCHAR(64) UNIQUE NOT NULL,
  answer_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  final_score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  letter_grade VARCHAR(4) NOT NULL,
  cohort_rank VARCHAR(32) NOT NULL,
  pillars JSON NOT NULL,
  why_lost_marks JSON NOT NULL,
  improvement_suggestions JSON NOT NULL,
  certified_by VARCHAR(255),
  certified_date VARCHAR(255),
  audit_hash VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
  FOREIGN KEY (answer_id) REFERENCES student_answers(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
