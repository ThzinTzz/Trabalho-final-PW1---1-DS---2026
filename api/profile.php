<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    sendJsonResponse(405, ['message' => 'Método não permitido.']);
}

startUserSession();
$userId = filter_var($_SESSION['user_id'] ?? null, FILTER_VALIDATE_INT);
if ($userId === false || $userId === null) {
    sendJsonResponse(401, ['message' => 'Faça login para consultar seu perfil.']);
}

$pdo = getDatabaseConnection();
try {
    $consulta = $pdo->prepare(
        'SELECT full_name, email, faculty, course
         FROM users
         WHERE id = :id
         LIMIT 1'
    );
    $consulta->execute([':id' => $userId]);
    $usuario = $consulta->fetch();
} catch (PDOException $erro) {
    error_log('Profile query failed: ' . $erro->getMessage());
    sendJsonResponse(500, ['message' => 'Não foi possível carregar o perfil.']);
}

if (!$usuario) {
    destroyUserSession();
    sendJsonResponse(401, ['message' => 'Faça login para consultar seu perfil.']);
}

sendJsonResponse(200, [
    'user' => [
        'nome' => $usuario['full_name'],
        'email' => $usuario['email'],
        'faculdade' => $usuario['faculty'],
        'curso' => $usuario['course']
    ]
]);
