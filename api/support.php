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
    sendJsonResponse(400, ['message' => 'Envie os dados da solicitação.']);
}

$dados = json_decode($json, true);
if (!is_array($dados) || json_last_error() !== JSON_ERROR_NONE) {
    sendJsonResponse(400, ['message' => 'Os dados enviados são inválidos.']);
}

foreach (['nome', 'email', 'descricao'] as $campo) {
    if (!isset($dados[$campo]) || !is_string($dados[$campo])) {
        sendJsonResponse(422, ['message' => 'Preencha todos os campos da solicitação.']);
    }
}

$nome = trim($dados['nome']);
$email = strtolower(trim($dados['email']));
$descricao = trim($dados['descricao']);
$tamanhoNome = preg_match_all('/./us', $nome);
$tamanhoDescricao = preg_match_all('/./us', $descricao);

if ($tamanhoNome === false || $tamanhoNome < 2 || $tamanhoNome > 120) {
    sendJsonResponse(422, ['message' => 'Informe um nome com até 120 caracteres.']);
}

if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    sendJsonResponse(422, ['message' => 'Informe um endereço de e-mail válido.']);
}

if ($tamanhoDescricao === false || $tamanhoDescricao < 1 || $tamanhoDescricao > 5000) {
    sendJsonResponse(422, ['message' => 'A descrição deve ter entre 1 e 5000 caracteres.']);
}

$pdo = getDatabaseConnection();
try {
    $consulta = $pdo->prepare(
        'INSERT INTO support_requests (name, email, description)
         VALUES (:name, :email, :description)'
    );
    $consulta->execute([
        ':name' => $nome,
        ':email' => $email,
        ':description' => $descricao
    ]);
} catch (PDOException $erro) {
    error_log('Support request insert failed: ' . $erro->getMessage());
    sendJsonResponse(500, ['message' => 'Não foi possível salvar sua solicitação.']);
}

sendJsonResponse(201, ['message' => 'Solicitação enviada e armazenada com sucesso.']);
