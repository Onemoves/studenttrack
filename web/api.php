<?php
declare(strict_types=1);
/*
 * StudentTrack API. Every request from the web app goes through here.
 * - Passwords are hashed. Each user only ever reads their own rows.
 * - Deleting a savings entry needs the admin to approve a request.
 * - Admin can see who is online, which page they are on, and short action labels. Never amounts, titles or notes.
 */

require __DIR__ . '/lib.php';

const SESSION_SECONDS = 604800;      // stay logged in for 7 days
const ONLINE_WINDOW_MS = 150000;     // "active" = seen in the last 2.5 minutes
const SAVE_TYPES = ['deposit', 'withdraw', 'to_wallet', 'to_savings'];
const NOTE_KINDS = ['assignment', 'quiz', 'project', 'exam', 'note'];
const LIST_COLORS = ['blue', 'orange', 'mint', 'pink', 'yellow', 'purple'];
const LIST_ICONS = ['list', 'cart', 'gift', 'plane', 'book', 'star', 'heart', 'home'];
const PAGES = [
    'dashboard' => 'Dashboard', 'savings' => 'Savings', 'spending' => 'Spending', 'notes' => 'Notes',
    'tasks' => 'Tasks', 'calendar' => 'Calendar', 'history' => 'History', 'journal' => 'Journal', 'lists' => 'Lists', 'chat' => 'Chat', 'profile' => 'Profile', 'more' => 'Menu',
];

ini_set('display_errors', '0');

class HttpError extends Exception {
    public int $status;
    public function __construct(int $status, string $message) { parent::__construct($message); $this->status = $status; }
}
function bad(string $m): HttpError { return new HttpError(400, $m); }

function send(int $status, array $payload): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

set_exception_handler(function (Throwable $e) {
    if ($e instanceof HttpError) send($e->status, ['error' => $e->getMessage()]);
    error_log('StudentTrack: ' . $e->getMessage());
    send(500, ['error' => 'Something went wrong on the server.']);
});

/* ------------------------------------------------------------- input checks */

function str(mixed $v, int $max, string $label, bool $required = false): string {
    $s = is_string($v) ? trim($v) : '';
    if ($required && $s === '') throw bad("$label is required.");
    if (mb_strlen($s) > $max) throw bad("$label is too long.");
    return $s;
}
function money(mixed $v, string $label): float {
    if (!is_numeric($v)) throw bad("$label must be more than 0.");
    $n = (float) $v;
    if (!is_finite($n) || $n <= 0 || $n > 10000000) throw bad("$label must be more than 0.");
    return round($n, 2);
}
function date_ok(mixed $v, string $label, bool $required = true): string {
    if (($v === null || $v === '') && !$required) return '';
    if (!is_string($v) || !preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $v, $m) || !checkdate((int)$m[2], (int)$m[3], (int)$m[1])) {
        throw bad("$label is not a valid date.");
    }
    return $v;
}
function time_ok(mixed $v): string {
    if ($v === null || $v === '') return '';
    if (!is_string($v) || !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $v)) throw bad('That time is not valid.');
    return $v;
}
function password_ok(mixed $pw): string {
    if (!is_string($pw) || strlen($pw) < 8) throw bad('Password must be at least 8 characters.');
    if (strlen($pw) > 128) throw bad('Password is too long.');
    return $pw;
}
function lock_suffix(): string { return DB_DRIVER === 'sqlite' ? '' : ' FOR UPDATE'; }
function peso(float $n): string { return '₱' . number_format($n, floor($n) == $n ? 0 : 2); }

/* ------------------------------------------------------------- rate limit */

function rate_limit(string $key, int $limit, int $windowMs): void {
    $k = substr(hash('sha256', $key), 0, 40);
    $now = now_ms();
    $row = q('SELECT n, window_start FROM st_login_attempts WHERE k = ?', [$k])->fetch();
    if (!$row || $now - (int) $row['window_start'] > $windowMs) {
        q('DELETE FROM st_login_attempts WHERE k = ?', [$k]);
        q('INSERT INTO st_login_attempts (k, n, window_start) VALUES (?, 1, ?)', [$k, $now]);
        if (random_int(1, 50) === 1) q('DELETE FROM st_login_attempts WHERE window_start < ?', [$now - 3600000]);
        return;
    }
    if ((int) $row['n'] >= $limit) throw new HttpError(429, 'Too many attempts. Please wait a few minutes and try again.');
    q('UPDATE st_login_attempts SET n = n + 1 WHERE k = ?', [$k]);
}
function clear_limit(string $key): void {
    q('DELETE FROM st_login_attempts WHERE k = ?', [substr(hash('sha256', $key), 0, 40)]);
}
function client_ip(): string { return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'); }

/* ------------------------------------------------------------- sessions */

function start_session(): void {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', (string) SESSION_SECONDS);
    session_name('studenttrack_sid');
    session_set_cookie_params(['lifetime' => SESSION_SECONDS, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
}

function current_user(): ?array {
    if (empty($_SESSION['uid'])) return null;
    $u = q('SELECT id, username, role, settings, sess_ver, last_seen FROM st_users WHERE id = ?', [(int) $_SESSION['uid']])->fetch();
    if (!$u || (int) $u['sess_ver'] !== (int) ($_SESSION['ver'] ?? -1)) { $_SESSION = []; return null; }
    $now = now_ms();
    if ($now - (int) $u['last_seen'] > 15000) {
        q('UPDATE st_users SET last_seen = ? WHERE id = ?', [$now, $u['id']]);
    }
    return $u;
}

function sign_in(array $u): void {
    session_regenerate_id(true);
    $_SESSION['uid'] = (int) $u['id'];
    $_SESSION['ver'] = (int) $u['sess_ver'];
    q('UPDATE st_users SET last_seen = ? WHERE id = ?', [now_ms(), $u['id']]);
}

function public_user(array $u): array { return ['id' => (int) $u['id'], 'username' => $u['username'], 'role' => $u['role']]; }

function read_settings(string $json): array {
    $s = json_decode($json, true);
    return array_merge(default_settings(), is_array($s) ? $s : []);
}

/* short labels for the admin's activity view (no amounts, titles or notes). Newest 30 kept. */
function log_activity(int $uid, string $label): void {
    q('INSERT INTO st_activity (user_id, label, created_at) VALUES (?, ?, ?)', [$uid, mb_substr($label, 0, 80), now_ms()]);
    if (random_int(1, 5) === 1) {
        $cut = q('SELECT id FROM st_activity WHERE user_id = ? ORDER BY id DESC LIMIT 1 OFFSET 30', [$uid])->fetch();
        if ($cut) q('DELETE FROM st_activity WHERE user_id = ? AND id <= ?', [$uid, $cut['id']]);
    }
}

/* ------------------------------------------------------------- balances */

function savings_balance(int $uid): float {
    $r = q("SELECT COALESCE(SUM(CASE WHEN type IN ('deposit','to_savings') THEN amount ELSE -amount END), 0) AS b FROM st_savings WHERE user_id = ?", [$uid])->fetch();
    return round((float) $r['b'], 2);
}
function wallet_balance(int $uid): float {
    $a = q("SELECT COALESCE(SUM(CASE WHEN kind = 'income' THEN amount WHEN kind = 'take' THEN -amount ELSE 0 END), 0) AS b FROM st_money WHERE user_id = ?", [$uid])->fetch();
    $b = q("SELECT COALESCE(SUM(CASE WHEN type = 'to_wallet' THEN amount WHEN type = 'to_savings' THEN -amount ELSE 0 END), 0) AS b FROM st_savings WHERE user_id = ?", [$uid])->fetch();
    return round((float) $a['b'] + (float) $b['b'], 2);
}

/* ------------------------------------------------------------- routing */

$routes = [];
function route(string $method, string $pattern, string $access, callable $fn): void {
    global $routes;
    $routes[] = [$method, '#^' . preg_replace('#:(\w+)#', '(?P<$1>[^/]+)', $pattern) . '$#', $access, $fn];
}

/* ---- public ---- */

route('GET', '/public', 'public', fn($c) => ['needCode' => SIGNUP_CODE !== '']);

route('POST', '/register', 'public', function ($c) {
    rate_limit('reg:' . client_ip(), 10, 3600000);
    $b = $c['body'];
    if (SIGNUP_CODE !== '' && !hash_equals(SIGNUP_CODE, trim((string) ($b['code'] ?? '')))) throw new HttpError(403, 'That sign-up code is not right.');
    $username = str($b['username'] ?? '', 20, 'Username', true);
    if (!preg_match('/^[A-Za-z0-9_.]{3,20}$/', $username)) throw bad('Username must be 3 to 20 letters, numbers, dots or underscores.');
    $password = password_ok($b['password'] ?? '');
    $name = str($b['name'] ?? '', 30, 'Name');
    if (q('SELECT 1 FROM st_users WHERE username = ?', [$username])->fetch()) throw new HttpError(409, 'That username is taken.');
    $settings = json_encode(array_merge(default_settings(), ['name' => $name]), JSON_UNESCAPED_UNICODE);
    q("INSERT INTO st_users (username, pass_hash, role, settings, created_at) VALUES (?, ?, 'user', ?, ?)", [$username, hash_pw($password), $settings, now_ms()]);
    $u = q('SELECT id, username, role, sess_ver FROM st_users WHERE username = ?', [$username])->fetch();
    sign_in($u);
    log_activity((int) $u['id'], 'Created the account');
    return ['user' => public_user($u)];
});

route('POST', '/login', 'public', function ($c) {
    $b = $c['body'];
    $username = str($b['username'] ?? '', 20, 'Username');
    $key = 'login:' . client_ip() . ':' . strtolower($username);
    rate_limit($key, 8, 600000);
    $u = q('SELECT id, username, role, sess_ver, pass_hash FROM st_users WHERE username = ?', [$username])->fetch();
    $pw = is_string($b['password'] ?? null) ? $b['password'] : '';
    if ($u) {
        $ok = verify_pw($pw, $u['pass_hash']);
    } else {
        verify_pw($pw, hash_pw('not-a-real-password'));   // same work either way, so timing does not reveal real usernames
        $ok = false;
    }
    if (!$u || !$ok) throw new HttpError(401, 'Wrong username or password.');
    clear_limit($key);
    sign_in($u);
    if ($u['role'] === 'user') log_activity((int) $u['id'], 'Logged in');
    return ['user' => public_user($u)];
});

/* ---- any signed-in account ---- */

route('POST', '/logout', 'any', function ($c) {
    $u = $c['user'];
    if ($u['role'] === 'user') log_activity((int) $u['id'], 'Logged out');
    q("UPDATE st_users SET last_seen = 0, last_page = '' WHERE id = ?", [$u['id']]);
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Lax']);
    }
    session_destroy();
    return ['ok' => true];
});

route('GET', '/me', 'any', fn($c) => ['user' => public_user($c['user']), 'settings' => read_settings($c['user']['settings'])]);

route('POST', '/password', 'any', function ($c) {
    $u = $c['user']; $b = $c['body'];
    rate_limit('pw:' . $u['id'], 10, 3600000);
    $row = q('SELECT pass_hash FROM st_users WHERE id = ?', [$u['id']])->fetch();
    if (!verify_pw(is_string($b['current'] ?? null) ? $b['current'] : '', $row['pass_hash'])) throw new HttpError(403, 'Your current password is wrong.');
    $next = password_ok($b['next'] ?? '');
    q('UPDATE st_users SET pass_hash = ?, sess_ver = sess_ver + 1 WHERE id = ?', [hash_pw($next), $u['id']]);
    $_SESSION['ver'] = (int) $u['sess_ver'] + 1;     // keep this device signed in, sign out the others
    if ($u['role'] === 'user') log_activity((int) $u['id'], 'Changed password');
    return ['ok' => true];
});

/* the web app tells us which page is open so the admin can see who is around */
route('POST', '/ping', 'user', function ($c) {
    $u = $c['user'];
    $page = (string) ($c['body']['page'] ?? '');
    if (!isset(PAGES[$page])) return ['ok' => true];
    $prev = q('SELECT last_page FROM st_users WHERE id = ?', [$u['id']])->fetch();
    q('UPDATE st_users SET last_seen = ?, last_page = ? WHERE id = ?', [now_ms(), $page, $u['id']]);
    if (($prev['last_page'] ?? '') !== $page) log_activity((int) $u['id'], 'Viewed ' . PAGES[$page]);
    return ['ok' => true];
});

/* ---- user data ---- */

route('GET', '/data', 'user', function ($c) {
    $uid = (int) $c['user']['id'];
    $savings = array_map(fn($r) => [
        'id' => $r['id'], 'type' => $r['type'], 'amount' => (float) $r['amount'], 'date' => $r['date'],
        'category' => $r['category'], 'note' => $r['note'], 'createdAt' => (int) $r['created_at'],
        'pendingRequestId' => $r['pending_id'] !== null ? (int) $r['pending_id'] : null,
    ], q("SELECT s.id, s.type, s.amount, s.date, s.category, s.note, s.created_at,
                 (SELECT MAX(r.id) FROM st_requests r WHERE r.tx_id = s.id AND r.status = 'pending') AS pending_id
          FROM st_savings s WHERE s.user_id = ? ORDER BY s.date DESC, s.created_at DESC LIMIT 3000", [$uid])->fetchAll());
    $money = array_map(fn($r) => [
        'id' => $r['id'], 'kind' => $r['kind'], 'amount' => (float) $r['amount'], 'date' => $r['date'],
        'category' => $r['category'], 'note' => $r['note'], 'createdAt' => (int) $r['created_at'],
    ], q('SELECT id, kind, amount, date, category, note, created_at FROM st_money WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 3000', [$uid])->fetchAll());
    $notes = array_map(fn($r) => [
        'id' => $r['id'], 'title' => $r['title'], 'subject' => $r['subject'], 'kind' => $r['kind'],
        'dueDate' => $r['due_date'], 'dueTime' => $r['due_time'], 'body' => $r['body'], 'items' => json_decode((string) ($r['items'] ?? '[]'), true) ?: [],
        'done' => (int) $r['done'] === 1, 'doneDate' => $r['done_date'], 'createdAt' => (int) $r['created_at'],
    ], q('SELECT id, title, subject, kind, due_date, due_time, body, items, done, done_date, created_at FROM st_notes WHERE user_id = ? ORDER BY created_at DESC LIMIT 2000', [$uid])->fetchAll());
    $tasks = array_map(fn($r) => [
        'id' => $r['id'], 'title' => $r['title'], 'date' => $r['date'], 'time' => $r['start_time'], 'tag' => $r['tag'],
        'done' => (int) $r['done'] === 1, 'doneDate' => $r['done_date'], 'createdAt' => (int) $r['created_at'],
    ], q('SELECT id, title, date, start_time, tag, done, done_date, created_at FROM st_tasks WHERE user_id = ? ORDER BY date DESC, start_time, created_at LIMIT 3000', [$uid])->fetchAll());
    $requests = array_map(fn($r) => [
        'id' => (int) $r['id'], 'txId' => $r['tx_id'], 'type' => $r['type'], 'amount' => (float) $r['amount'], 'date' => $r['date'],
        'category' => $r['category'], 'note' => $r['note'], 'reason' => $r['reason'], 'status' => $r['status'], 'adminNote' => $r['admin_note'],
        'createdAt' => (int) $r['created_at'], 'decidedAt' => $r['decided_at'] !== null ? (int) $r['decided_at'] : null,
    ], q('SELECT id, tx_id, type, amount, date, category, note, reason, status, admin_note, created_at, decided_at
          FROM st_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [$uid])->fetchAll());
    ensure_schema();
    $journal = array_map(fn($r) => [
        'id' => $r['id'], 'date' => $r['date'], 'mood' => (int) $r['mood'], 'title' => $r['title'], 'body' => $r['body'],
        'createdAt' => (int) $r['created_at'], 'updatedAt' => (int) $r['updated_at'],
    ], q('SELECT id, date, mood, title, body, created_at, updated_at FROM st_journal WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 1500', [$uid])->fetchAll());
    $items = [];
    foreach (q('SELECT id, list_id, text, done, created_at FROM st_list_items WHERE user_id = ? ORDER BY created_at LIMIT 5000', [$uid])->fetchAll() as $r) {
        $items[$r['list_id']][] = ['id' => $r['id'], 'text' => $r['text'], 'done' => (int) $r['done'] === 1, 'createdAt' => (int) $r['created_at']];
    }
    $lists = array_map(fn($r) => [
        'id' => $r['id'], 'title' => $r['title'], 'color' => $r['color'], 'icon' => $r['icon'],
        'createdAt' => (int) $r['created_at'], 'items' => $items[$r['id']] ?? [],
    ], q('SELECT id, title, color, icon, created_at FROM st_lists WHERE user_id = ? ORDER BY created_at LIMIT 200', [$uid])->fetchAll());
    return ['savings' => $savings, 'money' => $money, 'notes' => $notes, 'tasks' => $tasks, 'requests' => $requests,
            'journal' => $journal, 'lists' => $lists, 'settings' => read_settings($c['user']['settings'])];
});

route('PUT', '/settings', 'user', function ($c) {
    $b = $c['body'];
    $theme = $b['theme'] ?? 'dark';
    $keep = read_settings($c['user']['settings']);
    $s = [
        'avatar' => (string) ($keep['avatar'] ?? ''),
        'name' => str($b['name'] ?? '', 30, 'Name'),
        'course' => str($b['course'] ?? '', 40, 'Course'),
        'target' => max(0, min(100000000, (float) ($b['target'] ?? 0))),
        'theme' => in_array($theme, ['auto', 'dark', 'light'], true) ? $theme : 'dark',
        'hide' => ($b['hide'] ?? false) === true,
    ];
    q('UPDATE st_users SET settings = ? WHERE id = ?', [json_encode($s, JSON_UNESCAPED_UNICODE), $c['user']['id']]);
    return ['settings' => $s];
});

/* profile picture: the app crops and shrinks it to a small square JPEG first, so it is stored as a data URL inside the settings */
route('PUT', '/avatar', 'any', function ($c) {
    $a = $c['body']['avatar'] ?? '';
    if (!is_string($a)) throw bad('That picture is not valid.');
    if ($a !== '' && (strlen($a) > 45000 || !preg_match('#^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$#', $a))) throw bad('That picture is not valid or is too big.');
    $s = read_settings($c['user']['settings']);
    $s['avatar'] = $a;
    q('UPDATE st_users SET settings = ? WHERE id = ?', [json_encode($s, JSON_UNESCAPED_UNICODE), $c['user']['id']]);
    return ['ok' => true];
});

/* ---- savings: deposit, withdraw, transfer. Users add; only the admin can remove one. ---- */

route('POST', '/savings', 'user', function ($c) {
    $b = $c['body']; $uid = (int) $c['user']['id']; $pdo = db();
    $type = $b['type'] ?? '';
    if (!in_array($type, SAVE_TYPES, true)) throw bad('Choose deposit, withdraw or transfer.');
    $amount = money($b['amount'] ?? 0, 'Amount');
    $date = date_ok($b['date'] ?? null, 'Date');
    $cat = str($b['category'] ?? '', 30, 'Category');
    $note = str($b['note'] ?? '', 80, 'Notes');
    $id = uuid();
    $pdo->beginTransaction();
    try {
        q('SELECT id FROM st_users WHERE id = ?' . lock_suffix(), [$uid])->fetch();     // one money change at a time per user
        if ($type === 'withdraw' || $type === 'to_wallet') {
            $have = savings_balance($uid);
            if ($amount > $have + 0.001) throw bad('Your savings only have ' . peso($have) . '.');
        }
        if ($type === 'to_savings') {
            $have = wallet_balance($uid);
            if ($amount > $have + 0.001) throw bad('Your wallet only has ' . peso(max(0, $have)) . '.');
        }
        q('INSERT INTO st_savings (id, user_id, type, amount, date, category, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [$id, $uid, $type, $amount, $date, $cat, $note, now_ms()]);
        $pdo->commit();
    } catch (Throwable $t) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $t; }
    log_activity($uid, ['deposit' => 'Added a deposit', 'withdraw' => 'Made a withdrawal', 'to_wallet' => 'Moved money to the wallet', 'to_savings' => 'Moved money to savings'][$type]);
    return ['id' => $id];
});

route('POST', '/savings/:id/delete-request', 'user', function ($c) {
    $uid = (int) $c['user']['id']; $pdo = db();
    $reason = str($c['body']['reason'] ?? '', 200, 'Reason');
    $pdo->beginTransaction();
    try {
        $s = q('SELECT id, type, amount, date, category, note FROM st_savings WHERE id = ? AND user_id = ?' . lock_suffix(), [$c['params']['id'], $uid])->fetch();
        if (!$s) throw new HttpError(404, 'Transaction not found.');
        if (q("SELECT 1 FROM st_requests WHERE tx_id = ? AND status = 'pending'", [$s['id']])->fetch()) throw new HttpError(409, 'There is already a pending deletion request for this transaction.');
        q('INSERT INTO st_requests (tx_id, user_id, type, amount, date, category, note, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [$s['id'], $uid, $s['type'], $s['amount'], $s['date'], $s['category'], $s['note'], $reason, now_ms()]);
        $pdo->commit();
    } catch (Throwable $e) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $e; }
    log_activity($uid, 'Asked the admin to delete a transaction');
    return ['ok' => true];
});

route('DELETE', '/delete-requests/:id', 'user', function ($c) {
    $st = q("DELETE FROM st_requests WHERE id = ? AND user_id = ? AND status = 'pending'", [(int) $c['params']['id'], $c['user']['id']]);
    if ($st->rowCount() < 1) throw new HttpError(404, 'No pending request found.');
    log_activity((int) $c['user']['id'], 'Cancelled a deletion request');
    return ['ok' => true];
});

/* ---- wallet: daily expenses and income ---- */

route('POST', '/money', 'user', function ($c) {
    $b = $c['body']; $uid = (int) $c['user']['id'];
    $kind = in_array($b['kind'] ?? 'expense', ['income', 'take'], true) ? $b['kind'] : 'expense';
    $amount = money($b['amount'] ?? 0, 'Amount');
    $date = date_ok($b['date'] ?? null, 'Date');
    $cat = str($b['category'] ?? '', 30, 'Category') ?: 'Others';
    $note = str($b['note'] ?? '', 80, 'Note');
    $id = uuid();
    if ($kind === 'take') {      // expenses never reduce the income wallet, but you cannot take more than you have
        $have = wallet_balance($uid);
        if ($amount > $have + 0.001) throw bad('Your income wallet only has ' . peso(max(0, $have)) . '.');
    }
    q('INSERT INTO st_money (id, user_id, kind, amount, date, category, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [$id, $uid, $kind, $amount, $date, $cat, $note, now_ms()]);
    log_activity($uid, $kind === 'income' ? 'Added income' : ($kind === 'take' ? 'Took money from income' : 'Added an expense'));
    return ['id' => $id];
});

route('DELETE', '/money/:id', 'user', function ($c) {
    $uid = (int) $c['user']['id'];
    $e = q('SELECT kind FROM st_money WHERE id = ? AND user_id = ?', [$c['params']['id'], $uid])->fetch();
    if (!$e) throw new HttpError(404, 'Entry not found.');
    q('DELETE FROM st_money WHERE id = ? AND user_id = ?', [$c['params']['id'], $uid]);
    log_activity($uid, $e['kind'] === 'income' ? 'Deleted an income entry' : ($e['kind'] === 'take' ? 'Deleted a withdrawal' : 'Deleted an expense'));
    return ['ok' => true];
});

/* ---- notes and assignments ---- */

function note_fields(array $b): array {
    $kind = $b['kind'] ?? 'assignment';
    if (!in_array($kind, NOTE_KINDS, true)) throw bad('Choose a type.');
    return [
        str($b['title'] ?? '', 80, 'Title', true),
        str($b['subject'] ?? '', 30, 'Subject') ?: 'General',
        $kind,
        date_ok($b['dueDate'] ?? '', 'Due date', false),
        time_ok($b['dueTime'] ?? ''),
        str($b['body'] ?? '', 2000, 'Notes'),
        note_items($b['items'] ?? []),
    ];
}
/* checklist: [{t: text, d: done}] kept as JSON, up to 40 lines */
function note_items(mixed $v): string {
    if (!is_array($v)) return '[]';
    $out = [];
    foreach (array_slice($v, 0, 40) as $it) {
        if (!is_array($it)) continue;
        $t = trim((string) ($it['t'] ?? ''));
        if ($t === '') continue;
        $out[] = ['t' => mb_substr($t, 0, 120), 'd' => !empty($it['d']) ? 1 : 0];
    }
    return json_encode($out, JSON_UNESCAPED_UNICODE);
}
function owned(string $table, string $id, int $uid): array {
    $r = q("SELECT * FROM $table WHERE id = ? AND user_id = ?", [$id, $uid])->fetch();
    if (!$r) throw new HttpError(404, 'Not found.');
    return $r;
}
function done_fields(array $b): array {
    $done = ($b['done'] ?? false) === true;
    return [$done ? 1 : 0, $done ? date_ok($b['date'] ?? null, 'Date') : ''];
}

route('POST', '/notes', 'user', function ($c) {
    ensure_schema();
    [$title, $subject, $kind, $date, $time, $body, $items] = note_fields($c['body']);
    $id = uuid();
    q('INSERT INTO st_notes (id, user_id, title, subject, kind, due_date, due_time, body, items, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [$id, $c['user']['id'], $title, $subject, $kind, $date, $time, $body, $items, now_ms()]);
    log_activity((int) $c['user']['id'], 'Added a note');
    return ['id' => $id];
});
route('PATCH', '/notes/:id', 'user', function ($c) {
    owned('st_notes', $c['params']['id'], (int) $c['user']['id']);
    ensure_schema();
    [$title, $subject, $kind, $date, $time, $body, $items] = note_fields($c['body']);
    q('UPDATE st_notes SET title = ?, subject = ?, kind = ?, due_date = ?, due_time = ?, body = ?, items = ? WHERE id = ? AND user_id = ?', [$title, $subject, $kind, $date, $time, $body, $items, $c['params']['id'], $c['user']['id']]);
    log_activity((int) $c['user']['id'], 'Edited a note');
    return ['ok' => true];
});
/* tick or untick lines of the checklist without touching anything else */
route('PATCH', '/notes/:id/items', 'user', function ($c) {
    ensure_schema();
    owned('st_notes', $c['params']['id'], (int) $c['user']['id']);
    q('UPDATE st_notes SET items = ? WHERE id = ? AND user_id = ?', [note_items($c['body']['items'] ?? []), $c['params']['id'], $c['user']['id']]);
    return ['ok' => true];
});
route('POST', '/notes/:id/done', 'user', function ($c) {
    owned('st_notes', $c['params']['id'], (int) $c['user']['id']);
    [$d, $date] = done_fields($c['body']);
    q('UPDATE st_notes SET done = ?, done_date = ? WHERE id = ? AND user_id = ?', [$d, $date, $c['params']['id'], $c['user']['id']]);
    log_activity((int) $c['user']['id'], $d ? 'Checked off a note' : 'Unchecked a note');
    return ['ok' => true];
});
route('DELETE', '/notes/:id', 'user', function ($c) {
    $st = q('DELETE FROM st_notes WHERE id = ? AND user_id = ?', [$c['params']['id'], $c['user']['id']]);
    if ($st->rowCount() < 1) throw new HttpError(404, 'Not found.');
    log_activity((int) $c['user']['id'], 'Deleted a note');
    return ['ok' => true];
});

/* ---- daily tasks and events ---- */

function task_fields(array $b): array {
    return [
        str($b['title'] ?? '', 80, 'Title', true),
        date_ok($b['date'] ?? null, 'Date'),
        time_ok($b['time'] ?? ''),
        str($b['tag'] ?? '', 20, 'Tag') ?: 'Personal',
    ];
}
route('POST', '/tasks', 'user', function ($c) {
    [$title, $date, $time, $tag] = task_fields($c['body']);
    $id = uuid();
    q('INSERT INTO st_tasks (id, user_id, title, date, start_time, tag, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [$id, $c['user']['id'], $title, $date, $time, $tag, now_ms()]);
    log_activity((int) $c['user']['id'], 'Added a task');
    return ['id' => $id];
});
route('PATCH', '/tasks/:id', 'user', function ($c) {
    owned('st_tasks', $c['params']['id'], (int) $c['user']['id']);
    [$title, $date, $time, $tag] = task_fields($c['body']);
    q('UPDATE st_tasks SET title = ?, date = ?, start_time = ?, tag = ? WHERE id = ? AND user_id = ?', [$title, $date, $time, $tag, $c['params']['id'], $c['user']['id']]);
    log_activity((int) $c['user']['id'], 'Edited a task');
    return ['ok' => true];
});
route('POST', '/tasks/:id/done', 'user', function ($c) {
    owned('st_tasks', $c['params']['id'], (int) $c['user']['id']);
    [$d, $date] = done_fields($c['body']);
    q('UPDATE st_tasks SET done = ?, done_date = ? WHERE id = ? AND user_id = ?', [$d, $date, $c['params']['id'], $c['user']['id']]);
    log_activity((int) $c['user']['id'], $d ? 'Completed a task' : 'Unchecked a task');
    return ['ok' => true];
});
route('DELETE', '/tasks/:id', 'user', function ($c) {
    $st = q('DELETE FROM st_tasks WHERE id = ? AND user_id = ?', [$c['params']['id'], $c['user']['id']]);
    if ($st->rowCount() < 1) throw new HttpError(404, 'Not found.');
    log_activity((int) $c['user']['id'], 'Deleted a task');
    return ['ok' => true];
});

/* ---- journal: private diary entries with a mood. The admin never sees them. ---- */

function journal_fields(array $b): array {
    $mood = (int) ($b['mood'] ?? 3);
    if ($mood < 1 || $mood > 5) throw bad('Pick a mood from 1 to 5.');
    $body = str($b['body'] ?? '', 4000, 'Entry', true);
    return [date_ok($b['date'] ?? null, 'Date'), $mood, str($b['title'] ?? '', 80, 'Title'), $body];
}
route('POST', '/journal', 'user', function ($c) {
    ensure_schema();
    [$date, $mood, $title, $body] = journal_fields($c['body']);
    $id = uuid(); $now = now_ms();
    q('INSERT INTO st_journal (id, user_id, date, mood, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [$id, $c['user']['id'], $date, $mood, $title, $body, $now, $now]);
    log_activity((int) $c['user']['id'], 'Wrote a journal entry');
    return ['id' => $id];
});
route('PATCH', '/journal/:id', 'user', function ($c) {
    owned('st_journal', $c['params']['id'], (int) $c['user']['id']);
    [$date, $mood, $title, $body] = journal_fields($c['body']);
    q('UPDATE st_journal SET date = ?, mood = ?, title = ?, body = ?, updated_at = ? WHERE id = ? AND user_id = ?', [$date, $mood, $title, $body, now_ms(), $c['params']['id'], $c['user']['id']]);
    log_activity((int) $c['user']['id'], 'Edited a journal entry');
    return ['ok' => true];
});
route('DELETE', '/journal/:id', 'user', function ($c) {
    $st = q('DELETE FROM st_journal WHERE id = ? AND user_id = ?', [$c['params']['id'], $c['user']['id']]);
    if ($st->rowCount() < 1) throw new HttpError(404, 'Not found.');
    log_activity((int) $c['user']['id'], 'Deleted a journal entry');
    return ['ok' => true];
});

/* ---- lists: grocery, wishlist, packing and so on ---- */

function list_fields(array $b): array {
    $color = $b['color'] ?? 'blue'; $icon = $b['icon'] ?? 'list';
    return [
        str($b['title'] ?? '', 40, 'List name', true),
        in_array($color, LIST_COLORS, true) ? $color : 'blue',
        in_array($icon, LIST_ICONS, true) ? $icon : 'list',
    ];
}
route('POST', '/lists', 'user', function ($c) {
    ensure_schema();
    [$title, $color, $icon] = list_fields($c['body']);
    if ((int) q('SELECT COUNT(*) AS n FROM st_lists WHERE user_id = ?', [$c['user']['id']])->fetch()['n'] >= 100) throw bad('You have reached 100 lists.');
    $id = uuid();
    q('INSERT INTO st_lists (id, user_id, title, color, icon, created_at) VALUES (?, ?, ?, ?, ?, ?)', [$id, $c['user']['id'], $title, $color, $icon, now_ms()]);
    log_activity((int) $c['user']['id'], 'Created a list');
    return ['id' => $id];
});
route('PATCH', '/lists/:id', 'user', function ($c) {
    owned('st_lists', $c['params']['id'], (int) $c['user']['id']);
    [$title, $color, $icon] = list_fields($c['body']);
    q('UPDATE st_lists SET title = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?', [$title, $color, $icon, $c['params']['id'], $c['user']['id']]);
    return ['ok' => true];
});
route('DELETE', '/lists/:id', 'user', function ($c) {
    $uid = (int) $c['user']['id'];
    owned('st_lists', $c['params']['id'], $uid);
    q('DELETE FROM st_list_items WHERE list_id = ? AND user_id = ?', [$c['params']['id'], $uid]);   // explicit, in case foreign keys are off
    q('DELETE FROM st_lists WHERE id = ? AND user_id = ?', [$c['params']['id'], $uid]);
    log_activity($uid, 'Deleted a list');
    return ['ok' => true];
});
route('POST', '/lists/:id/items', 'user', function ($c) {
    $uid = (int) $c['user']['id'];
    owned('st_lists', $c['params']['id'], $uid);
    $text = str($c['body']['text'] ?? '', 120, 'Item', true);
    if ((int) q('SELECT COUNT(*) AS n FROM st_list_items WHERE list_id = ?', [$c['params']['id']])->fetch()['n'] >= 500) throw bad('That list is full (500 items).');
    $id = uuid();
    q('INSERT INTO st_list_items (id, list_id, user_id, text, created_at) VALUES (?, ?, ?, ?, ?)', [$id, $c['params']['id'], $uid, $text, now_ms()]);
    return ['id' => $id];
});
route('POST', '/list-items/:id/done', 'user', function ($c) {
    owned('st_list_items', $c['params']['id'], (int) $c['user']['id']);
    q('UPDATE st_list_items SET done = ? WHERE id = ? AND user_id = ?', [($c['body']['done'] ?? false) === true ? 1 : 0, $c['params']['id'], $c['user']['id']]);
    return ['ok' => true];
});
route('DELETE', '/list-items/:id', 'user', function ($c) {
    $st = q('DELETE FROM st_list_items WHERE id = ? AND user_id = ?', [$c['params']['id'], $c['user']['id']]);
    if ($st->rowCount() < 1) throw new HttpError(404, 'Not found.');
    return ['ok' => true];
});
route('POST', '/lists/:id/clear-done', 'user', function ($c) {
    $uid = (int) $c['user']['id'];
    owned('st_lists', $c['params']['id'], $uid);
    q('DELETE FROM st_list_items WHERE list_id = ? AND user_id = ? AND done = 1', [$c['params']['id'], $uid]);
    return ['ok' => true];
});

/* ---- admin ---- */

/* ---- study tools: class schedule, grades, budgets, focus sessions ---- */
const CLASS_COLORS = ['blue', 'pink', 'mint', 'yellow', 'purple', 'orange'];
function rows_limit(string $t, int $uid, int $max): void {
    if ((int) q("SELECT COUNT(*) AS n FROM $t WHERE user_id = ?", [$uid])->fetch()['n'] >= $max) throw bad('You reached the limit for this list. Delete something first.');
}
function class_fields(array $b): array {
    $subject = str($b['subject'] ?? '', 40, 'Subject', true);
    $dow = (int) ($b['day'] ?? -1);
    if ($dow < 0 || $dow > 6) throw bad('Pick a day.');
    $start = time_ok($b['start'] ?? ''); $end = time_ok($b['end'] ?? '');
    if ($start === '' || $end === '') throw bad('Set the start and end time.');
    if ($end <= $start) throw bad('The class must end after it starts.');
    $color = in_array($b['color'] ?? '', CLASS_COLORS, true) ? $b['color'] : 'blue';
    return [$subject, $dow, $start, $end, str($b['room'] ?? '', 20, 'Room'), $color];
}
function grade_fields(array $b): array {
    $units = $b['units'] ?? null; $grade = $b['grade'] ?? null;
    if (!is_numeric($units) || (float) $units < 0.5 || (float) $units > 12) throw bad('Units must be from 0.5 to 12.');
    if (!is_numeric($grade) || (float) $grade < 1 || (float) $grade > 5) throw bad('The grade must be from 1.00 to 5.00.');
    return [str($b['subject'] ?? '', 40, 'Subject', true), round((float) $units, 1), round((float) $grade, 2), str($b['term'] ?? '', 20, 'Term')];
}
route('GET', '/extra', 'user', function ($c) {
    ensure_schema();
    $uid = (int) $c['user']['id'];
    return [
        'classes' => array_map(fn($r) => ['id' => $r['id'], 'subject' => $r['subject'], 'day' => (int) $r['dow'], 'start' => $r['start_time'], 'end' => $r['end_time'], 'room' => $r['room'], 'color' => $r['color']],
            q('SELECT * FROM st_classes WHERE user_id = ? ORDER BY dow, start_time LIMIT 200', [$uid])->fetchAll()),
        'grades' => array_map(fn($r) => ['id' => $r['id'], 'subject' => $r['subject'], 'units' => (float) $r['units'], 'grade' => (float) $r['grade'], 'term' => $r['term']],
            q('SELECT * FROM st_grades WHERE user_id = ? ORDER BY term, created_at LIMIT 200', [$uid])->fetchAll()),
        'budgets' => array_map(fn($r) => ['category' => $r['category'], 'amount' => (float) $r['amount']],
            q('SELECT category, amount FROM st_budgets WHERE user_id = ? ORDER BY category LIMIT 60', [$uid])->fetchAll()),
        'study' => array_map(fn($r) => ['id' => $r['id'], 'date' => $r['date'], 'minutes' => (int) $r['minutes'], 'label' => $r['label']],
            q('SELECT id, date, minutes, label FROM st_study WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 600', [$uid])->fetchAll()),
    ];
});
route('POST', '/classes', 'user', function ($c) {
    ensure_schema(); $uid = (int) $c['user']['id']; rows_limit('st_classes', $uid, 100);
    [$s, $d, $a, $e, $r, $col] = class_fields($c['body']); $id = uuid();
    q('INSERT INTO st_classes (id, user_id, subject, dow, start_time, end_time, room, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [$id, $uid, $s, $d, $a, $e, $r, $col, now_ms()]);
    return ['id' => $id];
});
route('PATCH', '/classes/:id', 'user', function ($c) {
    $uid = (int) $c['user']['id']; owned('st_classes', $c['params']['id'], $uid);
    [$s, $d, $a, $e, $r, $col] = class_fields($c['body']);
    q('UPDATE st_classes SET subject = ?, dow = ?, start_time = ?, end_time = ?, room = ?, color = ? WHERE id = ? AND user_id = ?', [$s, $d, $a, $e, $r, $col, $c['params']['id'], $uid]);
    return ['ok' => true];
});
route('DELETE', '/classes/:id', 'user', function ($c) {
    q('DELETE FROM st_classes WHERE id = ? AND user_id = ?', [$c['params']['id'], (int) $c['user']['id']]); return ['ok' => true];
});
route('POST', '/grades', 'user', function ($c) {
    ensure_schema(); $uid = (int) $c['user']['id']; rows_limit('st_grades', $uid, 150);
    [$s, $u, $g, $t] = grade_fields($c['body']); $id = uuid();
    q('INSERT INTO st_grades (id, user_id, subject, units, grade, term, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [$id, $uid, $s, $u, $g, $t, now_ms()]);
    return ['id' => $id];
});
route('PATCH', '/grades/:id', 'user', function ($c) {
    $uid = (int) $c['user']['id']; owned('st_grades', $c['params']['id'], $uid);
    [$s, $u, $g, $t] = grade_fields($c['body']);
    q('UPDATE st_grades SET subject = ?, units = ?, grade = ?, term = ? WHERE id = ? AND user_id = ?', [$s, $u, $g, $t, $c['params']['id'], $uid]);
    return ['ok' => true];
});
route('DELETE', '/grades/:id', 'user', function ($c) {
    q('DELETE FROM st_grades WHERE id = ? AND user_id = ?', [$c['params']['id'], (int) $c['user']['id']]); return ['ok' => true];
});
/* a monthly limit for one spending category; an amount of 0 removes it */
route('PUT', '/budgets', 'user', function ($c) {
    ensure_schema(); $uid = (int) $c['user']['id'];
    $cat = str($c['body']['category'] ?? '', 30, 'Category', true); $amt = $c['body']['amount'] ?? 0;
    if (!is_numeric($amt) || (float) $amt < 0 || (float) $amt > 10000000) throw bad('That amount is not valid.');
    q('DELETE FROM st_budgets WHERE user_id = ? AND category = ?', [$uid, $cat]);
    if ((float) $amt > 0) {
        rows_limit('st_budgets', $uid, 30);
        q('INSERT INTO st_budgets (user_id, category, amount) VALUES (?, ?, ?)', [$uid, $cat, round((float) $amt, 2)]);
    }
    return ['ok' => true];
});
route('POST', '/study', 'user', function ($c) {
    ensure_schema(); $uid = (int) $c['user']['id'];
    $min = (int) ($c['body']['minutes'] ?? 0);
    if ($min < 1 || $min > 240) throw bad('A session is 1 to 240 minutes.');
    $date = date_ok($c['body']['date'] ?? '', 'Date');
    $n = q('SELECT COUNT(*) AS n FROM st_study WHERE user_id = ? AND date = ?', [$uid, $date])->fetch();
    if ((int) $n['n'] >= 60) throw bad('That is plenty for one day. Take a rest.');
    $id = uuid();
    q('INSERT INTO st_study (id, user_id, date, minutes, label, created_at) VALUES (?, ?, ?, ?, ?, ?)', [$id, $uid, $date, $min, str($c['body']['label'] ?? '', 40, 'Label'), now_ms()]);
    return ['id' => $id];
});
route('DELETE', '/study/:id', 'user', function ($c) {
    q('DELETE FROM st_study WHERE id = ? AND user_id = ?', [$c['params']['id'], (int) $c['user']['id']]); return ['ok' => true];
});

route('GET', '/admin/overview', 'admin', function ($c) {
    $now = now_ms();
    $pending = array_map(fn($r) => [
        'id' => (int) $r['id'], 'type' => $r['type'], 'amount' => (float) $r['amount'], 'date' => $r['date'], 'category' => $r['category'],
        'note' => $r['note'], 'reason' => $r['reason'], 'createdAt' => (int) $r['created_at'], 'username' => $r['username'],
    ], q("SELECT r.id, r.type, r.amount, r.date, r.category, r.note, r.reason, r.created_at, u.username
          FROM st_requests r JOIN st_users u ON u.id = r.user_id WHERE r.status = 'pending' ORDER BY r.created_at")->fetchAll());
    $decided = array_map(fn($r) => [
        'id' => (int) $r['id'], 'type' => $r['type'], 'amount' => (float) $r['amount'], 'date' => $r['date'], 'category' => $r['category'],
        'status' => $r['status'], 'adminNote' => $r['admin_note'], 'decidedAt' => $r['decided_at'] !== null ? (int) $r['decided_at'] : null, 'username' => $r['username'],
    ], q("SELECT r.id, r.type, r.amount, r.date, r.category, r.status, r.admin_note, r.decided_at, u.username
          FROM st_requests r JOIN st_users u ON u.id = r.user_id WHERE r.status <> 'pending' ORDER BY r.decided_at DESC LIMIT 20")->fetchAll());
    $users = array_map(function ($r) use ($now) {
        $seen = (int) $r['last_seen'];
        return [
            'id' => (int) $r['id'], 'username' => $r['username'], 'createdAt' => (int) $r['created_at'],
            'savings' => (int) $r['savings'], 'notes' => (int) $r['notes'],
            'lastSeen' => $seen, 'online' => $seen > 0 && $now - $seen < ONLINE_WINDOW_MS,
            'page' => $r['last_page'], 'pageLabel' => PAGES[$r['last_page']] ?? '',
        ];
    }, q("SELECT u.id, u.username, u.created_at, u.last_seen, u.last_page,
                 (SELECT COUNT(*) FROM st_savings s WHERE s.user_id = u.id) AS savings,
                 (SELECT COUNT(*) FROM st_notes n WHERE n.user_id = u.id) AS notes
          FROM st_users u WHERE u.role = 'user' ORDER BY u.last_seen DESC, u.created_at DESC")->fetchAll());
    usort($users, fn($a, $b) => [$b['online'], $b['lastSeen']] <=> [$a['online'], $a['lastSeen']]);
    return ['pending' => $pending, 'decided' => $decided, 'users' => $users, 'serverNow' => $now];
});

route('GET', '/admin/users/:id/activity', 'admin', function ($c) {
    $u = q("SELECT id, username FROM st_users WHERE id = ? AND role = 'user'", [(int) $c['params']['id']])->fetch();
    if (!$u) throw new HttpError(404, 'User not found.');
    $rows = q('SELECT label, created_at FROM st_activity WHERE user_id = ? ORDER BY id DESC LIMIT 30', [$u['id']])->fetchAll();
    return ['username' => $u['username'], 'items' => array_map(fn($r) => ['label' => $r['label'], 'at' => (int) $r['created_at']], $rows)];
});

function decide(string $status): callable {
    return function ($c) use ($status) {
        $note = str($c['body']['note'] ?? '', 200, 'Note');
        $pdo = db(); $pdo->beginTransaction();
        try {
            $r = q("SELECT id, tx_id, user_id FROM st_requests WHERE id = ? AND status = 'pending'" . lock_suffix(), [(int) $c['params']['id']])->fetch();
            if (!$r) throw new HttpError(404, 'That request is no longer pending.');
            if ($status === 'approved') {
                $uid = (int) $r['user_id'];
                q('SELECT id FROM st_users WHERE id = ?' . lock_suffix(), [$uid])->fetch();
                q('DELETE FROM st_savings WHERE id = ? AND user_id = ?', [$r['tx_id'], $uid]);
                /* never leave the user with negative savings */
                if (savings_balance($uid) < -0.001) throw new HttpError(409, 'Deleting this would make the savings negative, because later withdrawals depend on it. Reject it, or ask the user to explain.');
            }
            q('UPDATE st_requests SET status = ?, admin_note = ?, decided_at = ? WHERE id = ?', [$status, $note, now_ms(), $r['id']]);
            $pdo->commit();
        } catch (Throwable $t) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $t; }
        return ['ok' => true];
    };
}
route('POST', '/admin/requests/:id/approve', 'admin', decide('approved'));
route('POST', '/admin/requests/:id/reject', 'admin', decide('rejected'));

route('POST', '/admin/users/:id/reset-password', 'admin', function ($c) {
    $pw = password_ok($c['body']['password'] ?? '');
    $u = q("SELECT id FROM st_users WHERE id = ? AND role = 'user'", [(int) $c['params']['id']])->fetch();
    if (!$u) throw new HttpError(404, 'User not found.');
    q('UPDATE st_users SET pass_hash = ?, sess_ver = sess_ver + 1, last_seen = 0 WHERE id = ?', [hash_pw($pw), $u['id']]);
    log_activity((int) $u['id'], 'Password was reset by the admin');
    return ['ok' => true];
});

/* ------------------------------------------------------------- dispatch */


/* =========================================================== chat */

const CHAT_ONLINE_MS = 75000;
const CHAT_DIR = __DIR__ . '/chat_uploads';

function chat_limits(): array {
    $bytes = function (string $v): int {
        $v = trim($v); $n = (int) $v; $u = strtolower(substr($v, -1));
        if ($u === 'g') $n *= 1073741824; elseif ($u === 'm') $n *= 1048576; elseif ($u === 'k') $n *= 1024;
        return $n;
    };
    $srv = $bytes((string) ini_get('upload_max_filesize') ?: '2M');
    $post = $bytes((string) ini_get('post_max_size') ?: '8M');
    if ($post > 0) $srv = min($srv, $post - 65536);
    $srv = max($srv, 0);
    return ['image' => min(8 * 1048576, $srv), 'video' => min(25 * 1048576, $srv), 'gif' => defined('GIPHY_KEY') && GIPHY_KEY !== ''];
}

function chat_user(int $id): array {
    $u = q('SELECT id, username, role, settings, last_seen FROM st_users WHERE id = ?', [$id])->fetch();
    if (!$u) throw new HttpError(404, 'That person was not found.');
    return $u;
}
function chat_rel(int $a, int $b): ?array {
    $r = q('SELECT * FROM st_friends WHERE (a = ? AND b = ?) OR (a = ? AND b = ?)', [$a, $b, $b, $a])->fetch();
    return $r ?: null;
}
/* the admin can talk to anyone and anyone can talk to the admin; everyone else must be friends first */
function chat_allowed(array $me, array $other): bool {
    if ($me['role'] === 'admin' || $other['role'] === 'admin') return true;
    $r = chat_rel((int) $me['id'], (int) $other['id']);
    return $r && $r['status'] === 'accepted';
}
function chat_msg(array $r, int $meId): array {
    $gone = $r['kind'] === 'deleted';
    return ['id' => (int) $r['id'], 'mine' => (int) $r['from_id'] === $meId, 'kind' => $r['kind'], 'body' => $gone ? '' : $r['body'],
            'media' => $gone ? '' : $r['media'], 'mime' => $gone ? '' : $r['mime'], 'at' => (int) $r['created_at'], 'up' => (int) $r['updated_at'], 'read' => (int) $r['read_at'] > 0,
            'by' => (int) $r['from_id'], 'edited' => (int) $r['edited_at'] > 0];
}
const CHAT_STICKERS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '😎', '🥳', '😍', '🤣', '😭', '😡', '🤔', '👏', '💪', '🙌', '🥺', '😴', '🤝', '✅', '💯', '👌', '😅', '🤗', '😘', '🤩'];
const CHAT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
/* adds the emoji reactions ("rx") to a list of messages */
function chat_attach_rx(array $msgs, int $me): array {
    if (!$msgs) return $msgs;
    $ids = array_map(fn($m) => $m['id'], $msgs);
    $in = implode(',', array_fill(0, count($ids), '?'));
    $by = [];
    try {
        foreach (q("SELECT msg_id, emoji, user_id FROM st_chat_rx WHERE msg_id IN ($in)", $ids)->fetchAll() as $r) {
            $k = (int) $r['msg_id'];
            $by[$k][$r['emoji']]['n'] = ($by[$k][$r['emoji']]['n'] ?? 0) + 1;
            if ((int) $r['user_id'] === $me) $by[$k][$r['emoji']]['mine'] = true;
        }
    } catch (Throwable $e) { /* table not there yet */ }
    foreach ($msgs as &$m) {
        $m['rx'] = [];
        foreach (($by[$m['id']] ?? []) as $e => $v) $m['rx'][] = ['e' => $e, 'n' => $v['n'], 'mine' => !empty($v['mine'])];
        usort($m['rx'], fn($a, $b) => $b['n'] <=> $a['n']);
    }
    return $msgs;
}
function chat_name(array $u): string {
    $s = read_settings($u['settings']);
    $n = trim((string) $s['name']);
    return $u['role'] === 'admin' ? 'Admin' : ($n !== '' ? $n : $u['username']);
}
function chat_av(array $u): int {
    $s = read_settings($u['settings']);
    return $s['avatar'] !== '' ? (int) sprintf('%u', crc32($s['avatar'])) : 0;
}

/* everyone this person can see in their chat list: friends, requests and (for the admin or a user) the admin / people who wrote to the admin */
function chat_roster(array $me): array {
    $id = (int) $me['id']; $out = []; $seen = [];
    $add = function (array $u, string $st) use (&$out, &$seen) {
        if (isset($seen[$u['id']])) return; $seen[$u['id']] = 1;
        $out[] = ['id' => (int) $u['id'], 'username' => $u['username'], 'name' => chat_name($u), 'av' => chat_av($u), 'role' => $u['role'], 'st' => $st];
    };
    if ($me['role'] === 'user') {
        $adm = q("SELECT id, username, role, settings, last_seen FROM st_users WHERE role = 'admin' LIMIT 1")->fetch();
        if ($adm) $add($adm, 'admin');
    }
    $rows = q('SELECT f.a, f.b, f.status, u.id AS uid, u.username, u.role, u.settings, u.last_seen FROM st_friends f JOIN st_users u ON u.id = (CASE WHEN f.a = ? THEN f.b ELSE f.a END) WHERE f.a = ? OR f.b = ?', [$id, $id, $id])->fetchAll();
    foreach ($rows as $r) {
        $st = $r['status'] === 'accepted' ? 'friend' : ((int) $r['a'] === $id ? 'sent' : 'got');
        $add(['id' => $r['uid'], 'username' => $r['username'], 'role' => $r['role'], 'settings' => $r['settings']], $st);
    }
    if ($me['role'] === 'admin') {
        $rows = q("SELECT DISTINCT u.id, u.username, u.role, u.settings FROM st_users u JOIN st_chat c ON c.group_id = 0 AND ((c.from_id = u.id AND c.to_id = ?) OR (c.to_id = u.id AND c.from_id = ?)) WHERE u.id <> ?", [$id, $id, $id])->fetchAll();
        foreach ($rows as $r) $add($r, 'friend');
    }
    return $out;
}

route('PUT', '/chat/messages/:id/reaction', 'any', function ($c) {
    ensure_schema();
    $me = $c['user']; $id = (int) $me['id'];
    $r = q("SELECT * FROM st_chat WHERE id = ? AND kind NOT IN ('system', 'deleted')", [(int) $c['params']['id']])->fetch();
    if (!$r) throw new HttpError(404, 'Not found.');
    if ((int) $r['group_id'] > 0) chat_group_row((int) $r['group_id'], $id);
    elseif ((int) $r['from_id'] !== $id && (int) $r['to_id'] !== $id) throw new HttpError(403, 'Not allowed.');
    $e = (string) ($c['body']['emoji'] ?? '');
    if ($e !== '' && !in_array($e, CHAT_REACTIONS, true)) throw bad('That reaction is not available.');
    q('DELETE FROM st_chat_rx WHERE msg_id = ? AND user_id = ?', [$r['id'], $id]);
    if ($e !== '') q('INSERT INTO st_chat_rx (msg_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?)', [$r['id'], $id, $e, now_ms()]);
    q('UPDATE st_chat SET updated_at = ? WHERE id = ?', [now_ms(), $r['id']]);
    $m = chat_attach_rx([chat_msg(q('SELECT * FROM st_chat WHERE id = ?', [$r['id']])->fetch(), $id)], $id);
    return ['msg' => $m[0]];
});

route('GET', '/chat/limits', 'any', fn($c) => chat_limits());

route('GET', '/chat/roster', 'any', function ($c) {
    ensure_schema();
    return ['people' => chat_roster($c['user']), 'groups' => chat_groups_full((int) $c['user']['id']), 'limits' => chat_limits()];
});

route('GET', '/chat/people', 'any', function ($c) {
    ensure_schema();
    $me = $c['user']; $id = (int) $me['id'];
    $term = trim((string) ($_GET['q'] ?? ''));
    if (mb_strlen($term) < 2) return ['people' => []];
    $like = '%' . str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term) . '%';
    $rows = q("SELECT id, username, role, settings FROM st_users WHERE role = 'user' AND id <> ? AND username LIKE ? ESCAPE '!' ORDER BY username LIMIT 12", [$id, $like])->fetchAll();
    $out = [];
    foreach ($rows as $u) {
        $r = chat_rel($id, (int) $u['id']);
        $st = 'none';
        if ($r) $st = $r['status'] === 'accepted' ? 'friend' : ((int) $r['a'] === $id ? 'sent' : 'got');
        $out[] = ['id' => (int) $u['id'], 'username' => $u['username'], 'name' => chat_name($u), 'av' => chat_av($u), 'role' => 'user', 'st' => $st];
    }
    return ['people' => $out];
});

route('POST', '/chat/friends', 'user', function ($c) {
    ensure_schema();
    $id = (int) $c['user']['id'];
    $to = (int) ($c['body']['to'] ?? 0);
    if ($to === $id) throw bad('That is you.');
    $o = chat_user($to);
    if ($o['role'] !== 'user') throw bad('You can message the admin directly, no request needed.');
    $r = chat_rel($id, $to);
    if ($r) {
        if ($r['status'] === 'pending' && (int) $r['b'] === $id) q("UPDATE st_friends SET status = 'accepted' WHERE id = ?", [$r['id']]);
        return ['ok' => true];
    }
    q("INSERT INTO st_friends (a, b, status, created_at) VALUES (?, ?, 'pending', ?)", [$id, $to, now_ms()]);
    return ['ok' => true];
});
route('POST', '/chat/friends/:id/accept', 'user', function ($c) {
    $id = (int) $c['user']['id']; $from = (int) $c['params']['id'];
    $st = q("UPDATE st_friends SET status = 'accepted' WHERE a = ? AND b = ? AND status = 'pending'", [$from, $id]);
    if ($st->rowCount() < 1) throw new HttpError(404, 'That request is no longer there.');
    return ['ok' => true];
});
/* decline a request, cancel one you sent, or unfriend */
route('DELETE', '/chat/friends/:id', 'user', function ($c) {
    $id = (int) $c['user']['id']; $o = (int) $c['params']['id'];
    q('DELETE FROM st_friends WHERE (a = ? AND b = ?) OR (a = ? AND b = ?)', [$id, $o, $o, $id]);
    return ['ok' => true];
});

/* one light request does everything: who is online, unread counts, new messages for the open chat */
/* the groups this person is in, light version (no avatars) used by the poll */
function chat_my_group_rows(int $id): array {
    return q('SELECT g.id, g.name, g.owner_id, m2.user_id AS uid FROM st_groups g JOIN st_group_members m ON m.group_id = g.id AND m.user_id = ? JOIN st_group_members m2 ON m2.group_id = g.id ORDER BY g.id, m2.user_id', [$id])->fetchAll();
}
function chat_group_member_ids(array $rows): array {
    $by = [];
    foreach ($rows as $r) $by[(int) $r['id']][] = (int) $r['uid'];
    return $by;
}
function chat_groups_full(int $id): array {
    $rows = chat_my_group_rows($id); if (!$rows) return [];
    $uids = array_values(array_unique(array_map(fn($r) => (int) $r['uid'], $rows)));
    $in = implode(',', array_fill(0, count($uids), '?'));
    $users = [];
    foreach (q("SELECT id, username, role, settings FROM st_users WHERE id IN ($in)", $uids)->fetchAll() as $u)
        $users[(int) $u['id']] = ['id' => (int) $u['id'], 'username' => $u['username'], 'name' => chat_name($u), 'av' => chat_av($u)];
    $out = [];
    foreach ($rows as $r) {
        $g = (int) $r['id'];
        if (!isset($out[$g])) $out[$g] = ['id' => $g, 'name' => $r['name'], 'owner' => (int) $r['owner_id'], 'members' => []];
        if (isset($users[(int) $r['uid']])) $out[$g]['members'][] = $users[(int) $r['uid']];
    }
    return array_values($out);
}
function chat_group_row(int $gid, int $me): array {
    $g = q('SELECT g.* FROM st_groups g JOIN st_group_members m ON m.group_id = g.id WHERE g.id = ? AND m.user_id = ?', [$gid, $me])->fetch();
    if (!$g) throw new HttpError(403, 'You are not in this group.');
    return $g;
}
function chat_sysmsg(int $gid, int $by, string $text): void {
    $now = now_ms();
    q("INSERT INTO st_chat (from_id, to_id, kind, body, media, mime, created_at, updated_at, read_at, group_id) VALUES (?, ?, 'system', ?, '', '', ?, ?, 1, ?)", [$by, $by, $text, $now, $now, $gid]);
}

route('GET', '/chat/poll', 'any', function ($c) {
    ensure_schema();
    $me = $c['user']; $id = (int) $me['id']; $now = now_ms();
    q('UPDATE st_users SET last_seen = ? WHERE id = ?', [$now, $id]);
    $roster = chat_roster($me);
    $ids = array_map(fn($p) => $p['id'], $roster);
    $grows = chat_my_group_rows($id);
    $gmem = chat_group_member_ids($grows);
    $gnames = []; foreach ($grows as $r) $gnames[(int) $r['id']] = $r['name'];
    $sig = md5(json_encode([array_map(fn($p) => [$p['id'], $p['st']], $roster), array_map(fn($r) => [$r['id'], $r['name'], $r['owner_id'], $r['uid']], $grows)]));
    $allIds = $ids; foreach ($gmem as $list) foreach ($list as $u) if ($u !== $id) $allIds[] = $u;
    $allIds = array_values(array_unique($allIds));
    $ago = []; $last = []; $unread = [];
    if ($allIds) {
        $in = implode(',', array_fill(0, count($allIds), '?'));
        foreach (q("SELECT id, last_seen FROM st_users WHERE id IN ($in)", $allIds)->fetchAll() as $r) {
            $ls = (int) $r['last_seen'];
            $ago[(int) $r['id']] = $ls > 0 ? max(0, $now - $ls) : -1;
        }
    }
    if ($ids) {
        foreach (q('SELECT from_id, COUNT(*) AS n FROM st_chat WHERE to_id = ? AND group_id = 0 AND read_at = 0 AND kind <> \'deleted\' GROUP BY from_id', [$id])->fetchAll() as $r) $unread[(int) $r['from_id']] = (int) $r['n'];
        foreach ($ids as $o) {
            $m = q('SELECT * FROM st_chat WHERE group_id = 0 AND ((from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)) AND kind <> \'deleted\' ORDER BY id DESC LIMIT 1', [$id, $o, $o, $id])->fetch();
            if ($m) $last[$o] = ['mine' => (int) $m['from_id'] === $id, 'kind' => $m['kind'], 'body' => mb_substr($m['body'], 0, 60), 'at' => (int) $m['created_at']];
        }
    }
    foreach ($gnames as $g => $_) {
        $lr = q('SELECT last_read FROM st_group_members WHERE group_id = ? AND user_id = ?', [$g, $id])->fetch();
        $n = q("SELECT COUNT(*) AS n FROM st_chat WHERE group_id = ? AND id > ? AND from_id <> ? AND kind NOT IN ('deleted', 'system')", [$g, (int) ($lr['last_read'] ?? 0), $id])->fetch();
        if ((int) $n['n'] > 0) $unread[-$g] = (int) $n['n'];
        $m = q("SELECT * FROM st_chat WHERE group_id = ? AND kind <> 'deleted' ORDER BY id DESC LIMIT 1", [$g])->fetch();
        if ($m) $last[-$g] = ['mine' => (int) $m['from_id'] === $id, 'kind' => $m['kind'], 'body' => mb_substr($m['body'], 0, 60), 'at' => (int) $m['created_at'], 'by' => (int) $m['from_id']];
    }
    $out = ['t' => $now, 'sig' => $sig, 'ago' => (object) $ago, 'unread' => (object) $unread, 'last' => (object) $last, 'reqs' => count(array_filter($roster, fn($p) => $p['st'] === 'got'))];
    $with = (int) ($_GET['with'] ?? 0);
    $after = (int) ($_GET['after'] ?? 0); $since = (int) ($_GET['since'] ?? 0);
    if ($with < 0) {
        $gid = -$with; chat_group_row($gid, $id);
        if ($after <= 0) $rows = array_reverse(q('SELECT * FROM st_chat WHERE group_id = ? ORDER BY id DESC LIMIT 60', [$gid])->fetchAll());
        else $rows = q('SELECT * FROM st_chat WHERE group_id = ? AND (id > ? OR updated_at > ?) ORDER BY id ASC LIMIT 100', [$gid, $after, $since])->fetchAll();
        $mx = q('SELECT MAX(id) AS m FROM st_chat WHERE group_id = ?', [$gid])->fetch();
        q('UPDATE st_group_members SET last_read = ? WHERE group_id = ? AND user_id = ?', [(int) ($mx['m'] ?? 0), $gid, $id]);
        unset($out['unread']->{$with});
        $out['msgs'] = chat_attach_rx(array_map(fn($r) => chat_msg($r, $id), $rows), $id);
        $out['readUpTo'] = 0;
    } elseif ($with > 0) {
        $o = chat_user($with);
        if (!chat_allowed($me, $o)) throw new HttpError(403, 'You are not friends yet.');
        if ($after <= 0) {
            $rows = array_reverse(q('SELECT * FROM st_chat WHERE group_id = 0 AND ((from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)) ORDER BY id DESC LIMIT 60', [$id, $with, $with, $id])->fetchAll());
        } else {
            $rows = q('SELECT * FROM st_chat WHERE group_id = 0 AND ((from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)) AND (id > ? OR updated_at > ?) ORDER BY id ASC LIMIT 100', [$id, $with, $with, $id, $after, $since])->fetchAll();
        }
        q('UPDATE st_chat SET read_at = ? WHERE group_id = 0 AND from_id = ? AND to_id = ? AND read_at = 0', [$now, $with, $id]);
        $out['unread']->{$with} = 0;
        $rd = q('SELECT MAX(id) AS m FROM st_chat WHERE group_id = 0 AND from_id = ? AND to_id = ? AND read_at > 0', [$id, $with])->fetch();
        $out['msgs'] = chat_attach_rx(array_map(fn($r) => chat_msg($r, $id), $rows), $id);
        $out['readUpTo'] = (int) ($rd['m'] ?? 0);
    }
    return $out;
});

function chat_sniff(string $path): ?array {
    $h = (string) file_get_contents($path, false, null, 0, 16);
    if (strncmp($h, "\xFF\xD8\xFF", 3) === 0) return ['image', 'jpg', 'image/jpeg'];
    if (strncmp($h, "\x89PNG", 4) === 0) return ['image', 'png', 'image/png'];
    if (strncmp($h, 'GIF8', 4) === 0) return ['gif', 'gif', 'image/gif'];
    if (strncmp($h, 'RIFF', 4) === 0 && substr($h, 8, 4) === 'WEBP') return ['image', 'webp', 'image/webp'];
    if (substr($h, 4, 4) === 'ftyp') return ['video', substr($h, 8, 2) === 'qt' ? 'mov' : 'mp4', substr($h, 8, 2) === 'qt' ? 'video/quicktime' : 'video/mp4'];
    if (strncmp($h, "\x1A\x45\xDF\xA3", 4) === 0) return ['video', 'webm', 'video/webm'];
    return null;
}

function chat_ensure_dir(): void {
    if (is_dir(CHAT_DIR)) return;
    @mkdir(CHAT_DIR, 0755, true);
    @file_put_contents(CHAT_DIR . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n");
    @file_put_contents(CHAT_DIR . '/index.html', '');
}
/* GIF search is optional: it needs GIPHY_KEY in config.php and a host that allows outgoing requests */
function chat_gif_ok($u): bool {
    return is_string($u) && preg_match('#^https://media[0-9]*\.giphy\.com/[A-Za-z0-9/_.\-]+\.gif$#', $u) === 1;
}
function chat_http(string $url, int $max): ?string {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_FOLLOWLOCATION => false]);
        $d = curl_exec($ch); $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        return ($d !== false && $code === 200 && strlen($d) <= $max) ? $d : null;
    }
    $d = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 10]]));
    return ($d !== false && strlen($d) <= $max) ? $d : null;
}
route('GET', '/chat/gifs', 'any', function ($c) {
    if (!defined('GIPHY_KEY') || GIPHY_KEY === '') throw bad('GIF search is not set up on this site.');
    $q = trim((string) ($_GET['q'] ?? ''));
    $url = $q === '' ? 'https://api.giphy.com/v1/gifs/trending?' : 'https://api.giphy.com/v1/gifs/search?q=' . rawurlencode(mb_substr($q, 0, 50)) . '&';
    $url .= 'api_key=' . rawurlencode(GIPHY_KEY) . '&limit=24&rating=g';
    $raw = chat_http($url, 3000000);
    if ($raw === null) throw new HttpError(502, 'GIF search cannot be reached from this server.');
    $j = json_decode($raw, true); $out = [];
    foreach (($j['data'] ?? []) as $g) {
        $t = strtok((string) ($g['images']['fixed_width_small']['url'] ?? ''), '?'); $u = strtok((string) ($g['images']['fixed_width']['url'] ?? ''), '?');
        if (chat_gif_ok($t) && chat_gif_ok($u)) $out[] = ['thumb' => $t, 'url' => $u];
    }
    return ['gifs' => $out];
});

route('POST', '/chat/send', 'any', function ($c) {
    ensure_schema();
    $me = $c['user']; $id = (int) $me['id'];
    $isJson = $c['body'] !== [];
    $to = (int) ($isJson ? ($c['body']['to'] ?? 0) : ($_POST['to'] ?? 0));
    $text = $isJson ? ($c['body']['text'] ?? '') : ($_POST['text'] ?? '');
    $text = str($text, 2000, 'Message');
    $gid = 0;
    if ($to < 0) { $gid = -$to; chat_group_row($gid, $id); $to = $id; }
    else {
        $o = chat_user($to);
        if ($to === $id || !chat_allowed($me, $o)) throw new HttpError(403, 'You can only message friends and the admin.');
    }
    $recent = q('SELECT COUNT(*) AS n FROM st_chat WHERE from_id = ? AND created_at > ?', [$id, now_ms() - 60000])->fetch();
    if ((int) $recent['n'] >= 40) throw new HttpError(429, 'Slow down a little.');
    $kind = 'text'; $media = ''; $mime = '';
    $sh = $isJson ? ($c['body']['share'] ?? null) : null;
    if (is_array($sh)) {
        $stype = (string) ($sh['type'] ?? ''); $sid = (string) ($sh['id'] ?? '');
        if ($stype === 'note') {
            $r = q('SELECT * FROM st_notes WHERE id = ? AND user_id = ?', [$sid, $id])->fetch();
            if (!$r) throw new HttpError(404, 'That note was not found.');
            $pl = ['t' => 'note', 'title' => $r['title'], 'subject' => $r['subject'], 'kind' => $r['kind'], 'due' => $r['due_date'], 'time' => $r['due_time'], 'body' => mb_substr((string) $r['body'], 0, 300),
                   'items' => array_slice(json_decode((string) ($r['items'] ?? '[]'), true) ?: [], 0, 12)];
        } elseif ($stype === 'task') {
            $r = q('SELECT * FROM st_tasks WHERE id = ? AND user_id = ?', [$sid, $id])->fetch();
            if (!$r) throw new HttpError(404, 'That task was not found.');
            $pl = ['t' => 'task', 'title' => $r['title'], 'date' => $r['date'], 'time' => $r['start_time'], 'tag' => $r['tag']];
        } else throw bad('You can share a note or a task.');
        $json = json_encode($pl, JSON_UNESCAPED_UNICODE);
        while (mb_strlen($json) > 1800 && isset($pl['items']) && count($pl['items']) > 0) { array_pop($pl['items']); $json = json_encode($pl, JSON_UNESCAPED_UNICODE); }
        if (mb_strlen($json) > 1800) { $pl['body'] = ''; $json = json_encode($pl, JSON_UNESCAPED_UNICODE); }
        $kind = 'share'; $text = $json;
    }
    $stk = $isJson ? (string) ($c['body']['sticker'] ?? '') : '';
    $gifu = $isJson ? (string) ($c['body']['gif'] ?? '') : '';
    if ($stk !== '') {
        if (!in_array($stk, CHAT_STICKERS, true)) throw bad('That sticker is not available.');
        $kind = 'sticker'; $text = $stk;
    } elseif ($gifu !== '') {
        $gifu = strtok($gifu, '?');
        if (!chat_gif_ok($gifu)) throw bad('That GIF cannot be sent.');
        $d = chat_http($gifu, chat_limits()['image']);
        if ($d === null) throw new HttpError(502, 'Could not fetch that GIF.');
        $tmp = tempnam(sys_get_temp_dir(), 'gif'); file_put_contents($tmp, $d); $t = chat_sniff($tmp);
        if (!$t || !in_array($t[0], ['image', 'gif'], true)) { @unlink($tmp); throw bad('That GIF cannot be sent.'); }
        chat_ensure_dir();
        [$kind, $ext, $mime] = $t; $media = bin2hex(random_bytes(16)) . '.' . $ext;
        if (!@rename($tmp, CHAT_DIR . '/' . $media) && !@copy($tmp, CHAT_DIR . '/' . $media)) throw new HttpError(500, 'Could not save the file.');
        @unlink($tmp);
    }
    if (!empty($_FILES['file']) && is_array($_FILES['file']) && ($_FILES['file']['error'] ?? 4) !== UPLOAD_ERR_NO_FILE) {
        $f = $_FILES['file']; $lim = chat_limits();
        if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE) throw bad('That file is too big. This server allows up to ' . round($lim['video'] / 1048576) . ' MB.');
        if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) throw bad('The upload did not finish. Try again.');
        $t = chat_sniff($f['tmp_name']);
        if (!$t) throw bad('Only pictures (JPG, PNG, GIF, WEBP) and videos (MP4, MOV, WEBM) can be sent.');
        [$kind, $ext, $mime] = $t;
        $max = $kind === 'video' ? $lim['video'] : $lim['image'];
        if ((int) $f['size'] > $max) throw bad(($kind === 'video' ? 'Videos' : 'Pictures') . ' can be up to ' . round($max / 1048576) . ' MB.');
        if (!is_dir(CHAT_DIR)) {
            @mkdir(CHAT_DIR, 0755, true);
            @file_put_contents(CHAT_DIR . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n");
            @file_put_contents(CHAT_DIR . '/index.html', '');
        }
        $media = bin2hex(random_bytes(16)) . '.' . $ext;
        if (!move_uploaded_file($f['tmp_name'], CHAT_DIR . '/' . $media)) throw new HttpError(500, 'Could not save the file.');
    }
    if ($kind === 'text' && $text === '') throw bad('Write a message first.');
    $now = now_ms();
    q('INSERT INTO st_chat (from_id, to_id, kind, body, media, mime, created_at, updated_at, read_at, group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)', [$id, $to, $kind, $text, $media, $mime, $now, $now, $gid]);
    $nid = (int) db()->lastInsertId();
    $r = q('SELECT * FROM st_chat WHERE id = ?', [$nid])->fetch();
    return ['msg' => chat_msg($r, $id)];
});

route('POST', '/chat/shares/:id/save', 'user', function ($c) {
    $me = (int) $c['user']['id'];
    $r = q("SELECT * FROM st_chat WHERE id = ? AND kind = 'share'", [(int) $c['params']['id']])->fetch();
    if (!$r) throw new HttpError(404, 'Not found.');
    if ((int) $r['group_id'] > 0) chat_group_row((int) $r['group_id'], $me);
    elseif ((int) $r['to_id'] !== $me && (int) $r['from_id'] !== $me) throw new HttpError(404, 'Not found.');
    $pl = json_decode((string) $r['body'], true);
    if (!is_array($pl)) throw bad('That card cannot be saved.');
    $id = uuid(); $today = date('Y-m-d');
    $okd = fn($d) => is_string($d) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $d) && checkdate((int) substr($d, 5, 2), (int) substr($d, 8, 2), (int) substr($d, 0, 4));
    $okt = fn($t) => is_string($t) && preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $t);
    if (($pl['t'] ?? '') === 'note') {
        $items = []; foreach ((array) ($pl['items'] ?? []) as $it) { if (is_array($it)) $items[] = ['t' => (string) ($it['t'] ?? ''), 'd' => 0]; }
        $kind = in_array($pl['kind'] ?? '', NOTE_KINDS, true) ? $pl['kind'] : 'assignment';
        q('INSERT INTO st_notes (id, user_id, title, subject, kind, due_date, due_time, body, items, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [$id, $me, mb_substr((string) ($pl['title'] ?? 'Shared note'), 0, 80), mb_substr((string) ($pl['subject'] ?? ''), 0, 30) ?: 'General', $kind,
           $okd($pl['due'] ?? '') ? $pl['due'] : '', $okt($pl['time'] ?? '') ? $pl['time'] : '', mb_substr((string) ($pl['body'] ?? ''), 0, 2000), note_items($items), now_ms()]);
        log_activity($me, 'Saved a shared note');
        return ['ok' => true, 'what' => 'note'];
    }
    if (($pl['t'] ?? '') === 'task') {
        $d = $okd($pl['date'] ?? '') ? $pl['date'] : $today;
        q('INSERT INTO st_tasks (id, user_id, title, date, start_time, tag, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [$id, $me, mb_substr((string) ($pl['title'] ?? 'Shared task'), 0, 80), $d, $okt($pl['time'] ?? '') ? $pl['time'] : '', mb_substr((string) ($pl['tag'] ?? ''), 0, 20) ?: 'Personal', now_ms()]);
        log_activity($me, 'Saved a shared task');
        return ['ok' => true, 'what' => 'task'];
    }
    throw bad('That card cannot be saved.');
});

route('DELETE', '/chat/messages/:id', 'any', function ($c) {
    $id = (int) $c['user']['id'];
    $r = q("SELECT * FROM st_chat WHERE id = ? AND from_id = ? AND kind <> 'system'", [(int) $c['params']['id'], $id])->fetch();
    if (!$r) throw new HttpError(404, 'Not found.');
    if ($r['media'] !== '' && preg_match('/^[a-f0-9]{32}\.[a-z0-9]{3,4}$/', $r['media'])) @unlink(CHAT_DIR . '/' . $r['media']);
    q("UPDATE st_chat SET kind = 'deleted', body = '', media = '', mime = '', updated_at = ? WHERE id = ?", [now_ms(), $r['id']]);
    return ['ok' => true];
});


/* edit your own message (text, or the caption of a picture) */
route('PATCH', '/chat/messages/:id', 'any', function ($c) {
    ensure_schema();
    $id = (int) $c['user']['id'];
    $r = q("SELECT * FROM st_chat WHERE id = ? AND from_id = ? AND kind NOT IN ('system', 'deleted', 'sticker', 'share')", [(int) $c['params']['id'], $id])->fetch();
    if (!$r) throw new HttpError(404, 'Not found.');
    $text = str($c['body']['text'] ?? '', 2000, 'Message');
    if ($text === '' && $r['kind'] === 'text') throw bad('A message cannot be empty. Use unsend to remove it.');
    $now = now_ms();
    q('UPDATE st_chat SET body = ?, edited_at = ?, updated_at = ? WHERE id = ?', [$text, $now, $now, $r['id']]);
    return ['msg' => chat_attach_rx([chat_msg(q('SELECT * FROM st_chat WHERE id = ?', [$r['id']])->fetch(), $id)], $id)[0]];
});

/* ---- groups ---- */
function chat_can_add(array $me, int $uid): bool {
    if ($uid === (int) $me['id']) return false;
    $u = q('SELECT id, role FROM st_users WHERE id = ?', [$uid])->fetch();
    if (!$u || $u['role'] !== 'user') return false;
    if ($me['role'] === 'admin') return true;
    $r = chat_rel((int) $me['id'], $uid);
    return $r && $r['status'] === 'accepted';
}
function chat_ids(mixed $v): array {
    if (!is_array($v)) return [];
    return array_values(array_unique(array_filter(array_map('intval', $v), fn($x) => $x > 0)));
}
route('POST', '/chat/groups', 'user', function ($c) {
    ensure_schema();
    $me = $c['user']; $id = (int) $me['id'];
    $name = str($c['body']['name'] ?? '', 40, 'Group name', true);
    $mem = chat_ids($c['body']['members'] ?? []);
    if (count($mem) < 1) throw bad('Pick at least one friend.');
    if (count($mem) > 29) throw bad('A group can have up to 30 people.');
    foreach ($mem as $u) if (!chat_can_add($me, $u)) throw bad('You can only add your friends.');
    $now = now_ms();
    q('INSERT INTO st_groups (name, owner_id, created_at) VALUES (?, ?, ?)', [$name, $id, $now]);
    $gid = (int) db()->lastInsertId();
    q('INSERT INTO st_group_members (group_id, user_id, joined_at, last_read) VALUES (?, ?, ?, 0)', [$gid, $id, $now]);
    foreach ($mem as $u) q('INSERT INTO st_group_members (group_id, user_id, joined_at, last_read) VALUES (?, ?, ?, 0)', [$gid, $u, $now]);
    chat_sysmsg($gid, $id, chat_name($me) . ' created the group');
    return ['id' => $gid];
});
route('PATCH', '/chat/groups/:id', 'user', function ($c) {
    $me = $c['user']; $id = (int) $me['id']; $gid = (int) $c['params']['id'];
    $g = chat_group_row($gid, $id);
    $who = chat_name($me);
    if (array_key_exists('name', $c['body'])) {
        $name = str($c['body']['name'], 40, 'Group name', true);
        if ($name !== $g['name']) { q('UPDATE st_groups SET name = ? WHERE id = ?', [$name, $gid]); chat_sysmsg($gid, $id, $who . ' renamed the group to "' . $name . '"'); }
    }
    $add = chat_ids($c['body']['add'] ?? []);
    if ($add) {
        $cnt = (int) q('SELECT COUNT(*) AS n FROM st_group_members WHERE group_id = ?', [$gid])->fetch()['n'];
        if ($cnt + count($add) > 30) throw bad('A group can have up to 30 people.');
        foreach ($add as $u) {
            if (!chat_can_add($me, $u)) throw bad('You can only add your friends.');
            if (q('SELECT 1 FROM st_group_members WHERE group_id = ? AND user_id = ?', [$gid, $u])->fetch()) continue;
            q('INSERT INTO st_group_members (group_id, user_id, joined_at, last_read) VALUES (?, ?, ?, 0)', [$gid, $u, now_ms()]);
            chat_sysmsg($gid, $id, $who . ' added ' . chat_name(chat_user($u)));
        }
    }
    return ['ok' => true];
});
/* remove someone (owner only) or leave (remove yourself) */
route('DELETE', '/chat/groups/:id/members/:uid', 'user', function ($c) {
    $me = $c['user']; $id = (int) $me['id']; $gid = (int) $c['params']['id']; $uid = (int) $c['params']['uid'];
    $g = chat_group_row($gid, $id);
    if ($uid !== $id && (int) $g['owner_id'] !== $id) throw new HttpError(403, 'Only the group owner can remove people.');
    if (!q('SELECT 1 FROM st_group_members WHERE group_id = ? AND user_id = ?', [$gid, $uid])->fetch()) return ['ok' => true];
    $target = chat_user($uid);
    chat_sysmsg($gid, $id, $uid === $id ? chat_name($me) . ' left the group' : chat_name($me) . ' removed ' . chat_name($target));
    q('DELETE FROM st_group_members WHERE group_id = ? AND user_id = ?', [$gid, $uid]);
    $left = q('SELECT user_id FROM st_group_members WHERE group_id = ? ORDER BY joined_at, user_id', [$gid])->fetchAll();
    if (!$left) {
        foreach (q("SELECT media FROM st_chat WHERE group_id = ? AND media <> ''", [$gid])->fetchAll() as $m)
            if (preg_match('/^[a-f0-9]{32}\.[a-z0-9]{3,4}$/', $m['media'])) @unlink(CHAT_DIR . '/' . $m['media']);
        q('DELETE FROM st_chat_rx WHERE msg_id IN (SELECT id FROM st_chat WHERE group_id = ?)', [$gid]);
        q('DELETE FROM st_chat WHERE group_id = ?', [$gid]);
        q('DELETE FROM st_groups WHERE id = ?', [$gid]);
    } elseif ((int) $g['owner_id'] === $uid) {
        q('UPDATE st_groups SET owner_id = ? WHERE id = ?', [(int) $left[0]['user_id'], $gid]);
    }
    return ['ok' => true];
});

route('GET', '/chat/media/:name', 'any', function ($c) {
    $id = (int) $c['user']['id']; $name = $c['params']['name'];
    if (!preg_match('/^[a-f0-9]{32}\.[a-z0-9]{3,4}$/', $name)) throw new HttpError(404, 'Not found.');
    $m = q("SELECT mime FROM st_chat WHERE media = ? AND kind <> 'deleted' AND ((group_id = 0 AND (from_id = ? OR to_id = ?)) OR (group_id > 0 AND group_id IN (SELECT group_id FROM st_group_members WHERE user_id = ?)))", [$name, $id, $id, $id])->fetch();
    $file = CHAT_DIR . '/' . $name;
    if (!$m || !is_file($file)) throw new HttpError(404, 'Not found.');
    $size = filesize($file); $start = 0; $end = $size - 1; $code = 200;
    if (!empty($_SERVER['HTTP_RANGE']) && preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $mm)) {
        if ($mm[1] === '' && $mm[2] !== '') { $start = max(0, $size - (int) $mm[2]); }
        else { $start = (int) $mm[1]; if ($mm[2] !== '') $end = min($end, (int) $mm[2]); }
        if ($start > $end || $start >= $size) { http_response_code(416); header('Content-Range: bytes */' . $size); exit; }
        $code = 206;
    }
    http_response_code($code);
    header('Content-Type: ' . $m['mime']);
    header('Accept-Ranges: bytes');
    header('Content-Length: ' . ($end - $start + 1));
    if ($code === 206) header("Content-Range: bytes $start-$end/$size");
    header('Cache-Control: private, max-age=86400');
    header('X-Content-Type-Options: nosniff');
    while (ob_get_level()) ob_end_clean();
    $fp = fopen($file, 'rb'); fseek($fp, $start); $left = $end - $start + 1;
    while ($left > 0 && !feof($fp)) { $chunk = fread($fp, min(8192 * 8, $left)); echo $chunk; $left -= strlen($chunk); flush(); }
    fclose($fp);
    exit;
});
route('GET', '/chat/avatar/:id', 'any', function ($c) {
    $u = q('SELECT settings FROM st_users WHERE id = ?', [(int) $c['params']['id']])->fetch();
    $a = $u ? (string) read_settings($u['settings'])['avatar'] : '';
    if (!preg_match('#^data:(image/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$#', $a, $mm)) throw new HttpError(404, 'Not found.');
    header('Content-Type: ' . $mm[1]);
    header('Cache-Control: private, max-age=604800');
    header('X-Content-Type-Options: nosniff');
    echo base64_decode($mm[2]);
    exit;
});

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
/* some free hosts block PUT/PATCH/DELETE, so the app sends POST with an override header */
if ($method === 'POST' && !empty($_SERVER['HTTP_X_METHOD'])) {
    $o = strtoupper((string) $_SERVER['HTTP_X_METHOD']);
    if (in_array($o, ['PUT', 'PATCH', 'DELETE'], true)) $method = $o;
}
$path = (string) ($_GET['r'] ?? '/');
if ($path === '' || $path[0] !== '/') $path = '/' . $path;

if ($method !== 'GET' && ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'studenttrack') throw new HttpError(403, 'Blocked request.');

start_session();

foreach ($routes as [$m, $re, $access, $fn]) {
    if ($m !== $method || !preg_match($re, $path, $mm)) continue;
    $params = array_filter($mm, 'is_string', ARRAY_FILTER_USE_KEY);
    $user = null;
    if ($access !== 'public') {
        $user = current_user();
        if (!$user) throw new HttpError(401, 'Please log in.');
        if ($access === 'user' && $user['role'] !== 'user') throw new HttpError(403, 'You do not have permission to do that.');
        if ($access === 'admin' && $user['role'] !== 'admin') throw new HttpError(403, 'You do not have permission to do that.');
    }
    $body = [];
    if ($method !== 'GET' && $method !== 'DELETE') {
        $raw = file_get_contents('php://input');
        if (strlen((string) $raw) > 51200) throw new HttpError(413, 'Request too large.');
        if ($raw !== '' && $raw !== false) {
            $j = json_decode($raw, true);
            if (!is_array($j)) throw bad('Invalid request.');
            $body = $j;
        }
    }
    if (!in_array($path, ['/login', '/register', '/logout', '/password'], true)) {
        session_write_close();   // release the session lock so parallel requests do not queue up
    }
    send(200, $fn(['user' => $user, 'params' => $params, 'body' => $body]));
}
throw new HttpError(404, 'Not found.');
