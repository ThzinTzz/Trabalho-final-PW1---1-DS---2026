# Trabalho-final-PW1---1-DS---2026
Trabalho final de PW1 onde é para fazer um site com HTML, CSS e JavaScript. Usando o copilot do VS Code como um agente onde me ajudou demais, eu mesmo efetuei os comentários, não a inteligência artifícial, e procurei entender o código.

## Cadastro com PHP e MySQL

O cadastro usa PHP com PDO e MySQL. Para executar localmente com XAMPP:

1. Coloque a pasta `site` dentro de `htdocs`.
2. Inicie os serviços Apache e MySQL no XAMPP.
3. Importe `database.sql` pelo phpMyAdmin.
4. Abra `http://localhost/site/index.html` (não abra a página pelo endereço `file://`).

Por padrão, a conexão usa `127.0.0.1`, banco `exatasnahora`, usuário `root` e senha vazia, configuração comum do XAMPP local. Se sua instalação usar outros dados, configure as variáveis de ambiente `DB_HOST`, `DB_NAME`, `DB_USER` e `DB_PASSWORD` para o Apache/PHP ou ajuste os valores em `api/db.php`. Não use a configuração padrão em produção nem publique credenciais reais.

O endpoint `api/register.php` valida os campos e a combinação de faculdade/curso no servidor, impede e-mails duplicados e grava a senha com `password_hash`. O login em `api/login.php` verifica a senha e inicia uma sessão PHP; `api/profile.php` só retorna os dados do usuário autenticado e `api/logout.php` encerra a sessão. O formulário de suporte envia nome, e-mail e descrição para `api/support.php`, que armazena as solicitações na tabela `support_requests`.

A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes para evitar truncamento pelo algoritmo de hash padrão do PHP.
