<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    sendJsonResponse(405, ['message' => 'Método não permitido.']);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== 0) {
    sendJsonResponse(415, ['message' => 'Envie as credenciais no formato JSON.']);
}

$json = file_get_contents('php://input');
if ($json === false || trim($json) === '') {
    sendJsonResponse(400, ['message' => 'Informe o e-mail e a senha.']);
}

$dados = json_decode($json, true);
if (!is_array($dados) || json_last_error() !== JSON_ERROR_NONE) {
    sendJsonResponse(400, ['message' => 'As credenciais enviadas são inválidas.']);
}

if (!isset($dados['email'], $dados['senha']) || !is_string($dados['email']) || !is_string($dados['senha'])) {
    sendJsonResponse(400, ['message' => 'Informe o e-mail e a senha.']);
}

$email = strtolower(trim($dados['email']));
$senha = $dados['senha'];
if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    sendJsonResponse(401, ['message' => 'E-mail ou senha inválidos.']);
}

$pdo = getDatabaseConnection();
try {
    $consulta = $pdo->prepare(
        'SELECT id, password_hash
         FROM users
         WHERE email = :email
         LIMIT 1'
    );
    $consulta->execute([':email' => $email]);
    $usuario = $consulta->fetch();
} catch (PDOException $erro) {
    error_log('Login query failed: ' . $erro->getMessage());
    sendJsonResponse(500, ['message' => 'Não foi possível verificar as credenciais.']);
}

if (!$usuario || !password_verify($senha, $usuario['password_hash'])) {
    sendJsonResponse(401, ['message' => 'E-mail ou senha inválidos.']);
}

startUserSession();
if (!session_regenerate_id(true)) {
    error_log('Unable to regenerate the session ID after login.');
    sendJsonResponse(500, ['message' => 'Não foi possível iniciar a sessão.']);
}

$_SESSION['user_id'] = (int) $usuario['id'];
sendJsonResponse(200, ['authenticated' => true]);
