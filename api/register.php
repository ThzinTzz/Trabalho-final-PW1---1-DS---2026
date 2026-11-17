<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    sendJsonResponse(405, ['message' => 'Método não permitido.']);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== 0) {
    sendJsonResponse(415, ['message' => 'Envie os dados no formato JSON.']);
}

$json = file_get_contents('php://input');
if ($json === false || trim($json) === '') {
    sendJsonResponse(400, ['message' => 'Envie os dados do cadastro.']);
}

$dados = json_decode($json, true);
if (!is_array($dados) || json_last_error() !== JSON_ERROR_NONE) {
    sendJsonResponse(400, ['message' => 'Os dados enviados são inválidos.']);
}

$camposObrigatorios = ['nome', 'email', 'senha', 'faculdade', 'curso'];
foreach ($camposObrigatorios as $campo) {
    if (!isset($dados[$campo]) || !is_string($dados[$campo])) {
        sendJsonResponse(422, ['message' => 'Preencha todos os campos do cadastro.']);
    }
}

$nome = trim($dados['nome']);
$email = strtolower(trim($dados['email']));
$senha = $dados['senha'];
$faculdade = trim($dados['faculdade']);
$curso = trim($dados['curso']);
$tamanhoNome = preg_match_all('/./us', $nome);
$tamanhoSenha = preg_match_all('/./us', $senha);

if ($tamanhoNome === false || $tamanhoNome < 2 || $tamanhoNome > 120) {
    sendJsonResponse(422, ['message' => 'Informe um nome com até 120 caracteres.']);
}

if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    sendJsonResponse(422, ['message' => 'Informe um endereço de e-mail válido.']);
}

if ($tamanhoSenha === false || $tamanhoSenha < 8 || $tamanhoSenha > 72 || strlen($senha) > 72) {
    sendJsonResponse(422, ['message' => 'A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes.']);
}

$cursosPorFaculdade = [
    'Unicamp' => [
        'Ciência da Computação', 'Engenharia Agrícola', 'Engenharia Ambiental', 'Engenharia Civil',
        'Engenharia de Alimentos', 'Engenharia de Computação', 'Engenharia de Controle e Automação',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Estatística', 'Física',
        'Matemática', 'Química'
    ],
    'UNESP' => [
        'Ciência da Computação', 'Engenharia Ambiental', 'Engenharia Civil',
        'Engenharia de Controle e Automação', 'Engenharia de Produção', 'Engenharia Elétrica',
        'Engenharia Mecânica', 'Física', 'Matemática', 'Química'
    ],
    'USP' => [
        'Ciência da Computação', 'Engenharia Aeronáutica', 'Engenharia Civil',
        'Engenharia de Computação', 'Engenharia de Produção', 'Engenharia Elétrica',
        'Engenharia Mecânica', 'Engenharia Química', 'Estatística', 'Física', 'Matemática', 'Química'
    ],
    'UFRJ' => [
        'Ciência da Computação', 'Engenharia Civil', 'Engenharia de Computação e Informação',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Metalúrgica',
        'Engenharia Naval e Oceânica', 'Engenharia de Petróleo', 'Engenharia de Produção',
        'Engenharia Química', 'Física', 'Matemática', 'Química'
    ],
    'UFMG' => [
        'Ciência da Computação', 'Engenharia Civil', 'Engenharia de Controle e Automação',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Metalúrgica',
        'Engenharia de Minas', 'Engenharia de Produção', 'Engenharia Química', 'Estatística',
        'Física', 'Matemática', 'Química'
    ],
    'ITA' => [
        'Engenharia Aeronáutica', 'Engenharia Aeroespacial', 'Engenharia Civil-Aeronáutica',
        'Engenharia de Computação', 'Engenharia Eletrônica', 'Engenharia Mecânica-Aeronáutica'
    ],
    'UFRGS' => [
        'Ciência da Computação', 'Engenharia Ambiental', 'Engenharia Civil',
        'Engenharia de Computação', 'Engenharia de Materiais', 'Engenharia Elétrica',
        'Engenharia Mecânica', 'Engenharia Química', 'Estatística', 'Física', 'Matemática', 'Química'
    ],
    'UFSC' => [
        'Ciência da Computação', 'Engenharia Civil', 'Engenharia de Controle e Automação',
        'Engenharia de Materiais', 'Engenharia de Produção', 'Engenharia Elétrica',
        'Engenharia Mecânica', 'Engenharia Química', 'Física', 'Matemática', 'Química',
        'Sistemas de Informação'
    ],
    'UFPR' => [
        'Ciência da Computação', 'Engenharia Ambiental', 'Engenharia Cartográfica e de Agrimensura',
        'Engenharia Civil', 'Engenharia de Bioprocessos e Biotecnologia', 'Engenharia Elétrica',
        'Engenharia Mecânica', 'Engenharia Química', 'Engenharia de Produção', 'Física',
        'Matemática', 'Química'
    ],
    'UnB' => [
        'Ciência da Computação', 'Engenharia Ambiental', 'Engenharia Civil',
        'Engenharia de Computação', 'Engenharia de Redes de Comunicação', 'Engenharia de Produção',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Mecatrônica',
        'Engenharia Química', 'Estatística', 'Física', 'Matemática', 'Química'
    ],
    'UFPE' => [
        'Ciência da Computação', 'Engenharia Civil', 'Engenharia da Computação',
        'Engenharia de Controle e Automação', 'Engenharia de Materiais', 'Engenharia de Produção',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Estatística',
        'Física', 'Matemática', 'Química'
    ],
    'UFC' => [
        'Ciência da Computação', 'Engenharia Ambiental', 'Engenharia Civil',
        'Engenharia de Computação', 'Engenharia de Energias Renováveis', 'Engenharia de Produção',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Metalúrgica',
        'Engenharia Química', 'Estatística', 'Física', 'Matemática', 'Química'
    ]
];

if (!isset($cursosPorFaculdade[$faculdade]) || !in_array($curso, $cursosPorFaculdade[$faculdade], true)) {
    sendJsonResponse(422, ['message' => 'O curso selecionado não está disponível para essa faculdade.']);
}

$hashSenha = password_hash($senha, PASSWORD_DEFAULT);
if ($hashSenha === false) {
    error_log('Password hashing failed during registration.');
    sendJsonResponse(500, ['message' => 'Não foi possível proteger a senha do cadastro.']);
}

$pdo = getDatabaseConnection();
try {
    $consulta = $pdo->prepare(
        'INSERT INTO users (full_name, email, password_hash, faculty, course)
         VALUES (:full_name, :email, :password_hash, :faculty, :course)'
    );
    $consulta->execute([
        ':full_name' => $nome,
        ':email' => $email,
        ':password_hash' => $hashSenha,
        ':faculty' => $faculdade,
        ':course' => $curso
    ]);
} catch (PDOException $erro) {
    $informacoesErro = $erro->errorInfo;
    if ($erro->getCode() === '23000' && isset($informacoesErro[1]) && (int) $informacoesErro[1] === 1062) {
        sendJsonResponse(409, ['message' => 'Já existe um cadastro com esse e-mail.']);
    }

    error_log('Registration insert failed: ' . $erro->getMessage());
    sendJsonResponse(500, ['message' => 'Não foi possível salvar o cadastro.']);
}

sendJsonResponse(201, ['message' => 'Cadastro realizado com sucesso. Agora você já pode entrar com seu e-mail e senha.']);
