<?php
declare(strict_types=1);
/*
 * One-time setup: creates the database tables and the admin account.
 * Open this page once in your browser (or run:  php setup.php create-admin YourPassword )
 * When it says setup is finished, delete this file from your site.
 */

require __DIR__ . '/lib.php';

/* ---------- command line ---------- */
if (PHP_SAPI === 'cli') {
    try {
        install_schema();
    } catch (Throwable $e) {
        fwrite(STDERR, "Could not use the database: " . $e->getMessage() . "\nCheck config.php.\n");
        exit(1);
    }
    if (($argv[1] ?? '') === 'create-admin') {
        $pw = $argv[2] ?? '';
        if (strlen($pw) < 8) { fwrite(STDERR, "Usage: php setup.php create-admin <password with 8 or more characters>\n"); exit(1); }
        if (admin_exists()) { fwrite(STDERR, "An admin account already exists.\n"); exit(1); }
        create_admin($pw);
        echo "Admin account created. Username: admin\n";
        exit(0);
    }
    echo "Tables are ready. Create the admin with: php setup.php create-admin <password>\n";
    exit(0);
}

/* ---------- browser ---------- */
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }

function page(string $title, string $body): never {
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
       . '<title>StudentTrack setup</title><style>'
       . 'body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#070f24;color:#e8eefb;margin:0;padding:24px 16px;line-height:1.5}'
       . '.c{max-width:460px;margin:0 auto;background:#0c1730;border:1px solid #1b2d55;border-radius:20px;padding:24px}'
       . 'h1{margin:0 0 4px;font-size:1.5rem;color:#4da3ff}p{margin:8px 0}label{display:block;font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:#8fa3cc;margin:16px 0 6px;font-weight:600}'
       . 'input{width:100%;box-sizing:border-box;min-height:48px;font:inherit;font-size:16px;padding:10px 12px;border:1px solid #1b2d55;border-radius:12px;background:#101e3d;color:#e8eefb}'
       . 'button{margin-top:20px;width:100%;min-height:50px;border:0;border-radius:14px;background:#2f8cff;color:#fff;font:inherit;font-weight:700;font-size:1rem;cursor:pointer}'
       . '.e{background:#3a1620;color:#ff9aa3;border-radius:12px;padding:10px 12px}.ok{background:#0f2f2a;color:#6ff0c4;border-radius:12px;padding:10px 12px}code{background:#101e3d;padding:2px 6px;border-radius:6px}'
       . '</style></head><body><div class="c"><h1>' . h($title) . '</h1>' . $body . '</div></body></html>';
    exit;
}

if (strlen(SETUP_KEY) < 6) {
    page('Almost there', '<p>Before setup can run, open <code>config.php</code> and put a secret word of 6 or more characters between the quotes of <code>SETUP_KEY</code>. Only you know it, so nobody else can create the admin account.</p><p>Save the file, then refresh this page.</p>');
}

try {
    install_schema();
} catch (Throwable $e) {
    page('Cannot reach the database', '<p class="e">The tables could not be created.</p><p>Open <code>config.php</code> and check <b>DB_HOST</b>, <b>DB_NAME</b>, <b>DB_USER</b> and <b>DB_PASS</b>. On XAMPP, create an empty database named <code>studenttrack</code> in phpMyAdmin first and make sure MySQL is started.</p>');
}

if (admin_exists()) {
    page('Setup is finished', '<p class="ok">Your database and admin account are ready.</p><p>For safety, <b>delete setup.php</b> from your site now. Then open <a href="index.html">the app</a> and log in as <code>admin</code>.</p>');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $key = (string) ($_POST['key'] ?? '');
    $pw = (string) ($_POST['password'] ?? '');
    $pw2 = (string) ($_POST['password2'] ?? '');
    if (!hash_equals(SETUP_KEY, $key)) $error = 'That setup key is not right.';
    elseif (strlen($pw) < 8) $error = 'Use at least 8 characters for the password.';
    elseif ($pw !== $pw2) $error = 'The two passwords do not match.';
    else {
        create_admin($pw);
        page('Setup is finished', '<p class="ok">Admin account created. Username: <b>admin</b></p><p>For safety, <b>delete setup.php</b> from your site now. Then open <a href="index.html">the app</a> and log in.</p>');
    }
}

page('Create the admin account',
    '<p>The database tables are ready. Choose a password for the <b>admin</b> account.</p>'
    . ($error !== '' ? '<p class="e">' . h($error) . '</p>' : '')
    . '<form method="post" autocomplete="off">'
    . '<label for="key">Setup key (from config.php)</label><input id="key" name="key" type="password" required>'
    . '<label for="pw">Admin password</label><input id="pw" name="password" type="password" minlength="8" required>'
    . '<label for="pw2">Type it again</label><input id="pw2" name="password2" type="password" minlength="8" required>'
    . '<button type="submit">Create admin</button></form>');
