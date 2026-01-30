-- =====================================================
-- Script de criação do banco academia_db (MySQL)
-- Sistema de Gestão de Academias - Normalizado
-- =====================================================

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS academia_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE academia_db;

-- -----------------------------------------------------
-- Tabela: planos
-- Armazena os planos disponíveis (evita redundância)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS planos (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  duracao_dias INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT chk_planos_preco_positivo CHECK (preco > 0),
  CONSTRAINT chk_planos_duracao_positiva CHECK (duracao_dias > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: alunos
-- Dados dos alunos (entidade independente)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS alunos (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  email VARCHAR(150) NOT NULL,
  data_nascimento DATE NOT NULL,
  status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  PRIMARY KEY (id),
  UNIQUE KEY uk_alunos_cpf (cpf),
  KEY idx_alunos_status (status),
  KEY idx_alunos_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: matriculas
-- Associação aluno x plano com período (evita repetir dados do plano/aluno)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS matriculas (
  id INT NOT NULL AUTO_INCREMENT,
  aluno_id INT NOT NULL,
  plano_id INT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NULL,
  PRIMARY KEY (id),
  KEY idx_matriculas_aluno (aluno_id),
  KEY idx_matriculas_plano (plano_id),
  KEY idx_matriculas_datas (data_inicio, data_fim),
  CONSTRAINT fk_matriculas_aluno
    FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_matriculas_plano
    FOREIGN KEY (plano_id) REFERENCES planos (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_matriculas_data_fim CHECK (data_fim IS NULL OR data_fim >= data_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: pagamentos
-- Pagamentos vinculados à matrícula (1 matrícula = N pagamentos)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS pagamentos (
  id INT NOT NULL AUTO_INCREMENT,
  matricula_id INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  status_pagamento ENUM('pendente', 'pago') NOT NULL DEFAULT 'pendente',
  PRIMARY KEY (id),
  KEY idx_pagamentos_matricula (matricula_id),
  KEY idx_pagamentos_vencimento (data_vencimento),
  KEY idx_pagamentos_status (status_pagamento),
  CONSTRAINT fk_pagamentos_matricula
    FOREIGN KEY (matricula_id) REFERENCES matriculas (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_pagamentos_valor_positivo CHECK (valor > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Dados iniciais (opcional - planos exemplo)
-- -----------------------------------------------------
-- INSERT INTO planos (nome, preco, duracao_dias) VALUES
--   ('Mensal', 89.90, 30),
--   ('Trimestral', 249.90, 90),
--   ('Semestral', 449.90, 180),
--   ('Anual', 799.90, 365);
