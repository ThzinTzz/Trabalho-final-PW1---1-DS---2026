<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    sendJsonResponse(405, ['message' => 'Método não permitido.']);
}

destroyUserSession();
sendJsonResponse(200, ['message' => 'Sessão encerrada.']);
