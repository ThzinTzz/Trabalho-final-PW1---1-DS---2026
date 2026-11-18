-- Cria o banco de dados exatasnahora se ja não existe
CREATE DATABASE IF NOT EXISTS exatasnahora
    -- Define a codificação para aceitar caracteres UTF-8: acentos, emoji, etc
    CHARACTER SET utf8mb4

    -- Indica que não diferencia maiúsculas de minúsculas
    COLLATE utf8mb4_unicode_ci;

-- Seleciona o banco de dados que acabamos de criar para os comandos abaixo
USE exatasnahora;

-- Cria a tabela de usuários se ja não existe
CREATE TABLE IF NOT EXISTS users (
    -- Cria o campo id, números grandes inteiros, não pode ser vázio e se auto incrementa
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    -- Cria o campo nome inteiro que é um varchar até 120 caracteres e não pode ser vázio
    full_name VARCHAR(120) NOT NULL,

    -- Cria o campo email que é um var char até 254 caracteres e não pode ser vázio
    email VARCHAR(254) NOT NULL,

    -- Cria o campo senha que é um var char até 255 caracteres e não pode ser vázio
    password_hash VARCHAR(255) NOT NULL,

    -- Cria o campo faculdade que é um var char até 100 caracteres e não pode ser vázio
    faculty VARCHAR(100) NOT NULL,

    -- Cria o campo curso que é um var char até 150 caracteres e não pode ser vázio
    course VARCHAR(150) NOT NULL,

    -- Guarda a data e hora do cadastro que não pode ser vázio e é automático pois não tem o campo data no cadastro
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Define como chabe primária o id
    PRIMARY KEY (id),

    -- Impede que dois usuários tenham o mesmo email
    UNIQUE KEY uq_users_email (email)

)
-- Escolhe o mecanismo InnoDB para a tabela 
ENGINE=InnoDB
    -- Define a codificação para aceitar caracteres UTF-8: acentos, emoji, etc
    DEFAULT CHARACTER SET utf8mb4

    -- Indica que não diferencia maiúsculas de minúsculas
    COLLATE utf8mb4_unicode_ci;

-- Cria a tabela de suporte se já não existe
CREATE TABLE IF NOT EXISTS support_requests (

    -- Cria o campo id, números grandes inteiros, não pode ser vázio e se auto incrementa
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    -- Cria o campo nome inteiro que é um varchar até 120 caracteres e não pode ser vázio
    name VARCHAR(120) NOT NULL,

    -- Cria o campo email que é um var char até 254 caracteres e não pode ser vázio   
    email VARCHAR(254) NOT NULL,

    -- Cria o campo descrição que usa o tipo texto(valores maiores que o varchar) e não pode ser vázio
    description TEXT NOT NULL,

    -- Guarda a data e hora do cadastro que não pode ser vázio e é automático pois não tem o campo data no cadastro
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

     -- Define como chabe primária o id
    PRIMARY KEY (id)

)
-- Escolhe o mecanismo InnoDB para a tabela 
ENGINE=InnoDB
    -- Define a codificação para aceitar caracteres UTF-8: acentos, emoji, etc
    DEFAULT CHARACTER SET utf8mb4

    -- Indica que não diferencia maiúsculas de minúsculas
    COLLATE utf8mb4_unicode_ci;
