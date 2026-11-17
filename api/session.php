<?php
declare(strict_types=1);

function startUserSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_trans_sid', '0');

    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    if (!session_start()) {
        error_log('Unable to start the user session.');
        sendJsonResponse(500, ['message' => 'Não foi possível iniciar a sessão.']);
    }
}

function destroyUserSession(): void
{
    startUserSession();
    $_SESSION = [];

    $cookie = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires' => time() - 42000,
        'path' => $cookie['path'],
        'domain' => $cookie['domain'],
        'secure' => $cookie['secure'],
        'httponly' => $cookie['httponly'],
        'samesite' => $cookie['samesite'] ?? 'Lax'
    ]);

    if (!session_destroy()) {
        error_log('Unable to destroy the user session.');
        sendJsonResponse(500, ['message' => 'Não foi possível encerrar a sessão.']);
    }
}
