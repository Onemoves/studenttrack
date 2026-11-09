<?php
declare(strict_types=1);
/* Shared helpers: database connection, tables, passwords. Opening this file in a browser shows nothing. */

require __DIR__ . '/config.php';
date_default_timezone_set(TIMEZONE);

if (!function_exists('mb_strlen')) {      // a few hosts ship PHP without mbstring
    function mb_strlen(string $s): int { return preg_match_all('/./us', $s) ?: strlen($s); }
    function mb_substr(string $s, int $start, ?int $len = null): string {
        return implode('', array_slice(preg_split('//u', $s, -1, PREG_SPLIT_NO_EMPTY) ?: [], $start, $len));
    }
}

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $opts = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC];
    if (DB_DRIVER === 'sqlite') {
        $pdo = new PDO('sqlite:' . DB_FILE, null, null, $opts);
        $pdo->exec('PRAGMA foreign_keys = ON');
    } else {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, $opts + [PDO::ATTR_EMULATE_PREPARES => false]);
    }
    return $pdo;
}

function q(string $sql, array $params = []): PDOStatement {
    $st = db()->prepare($sql);
    $st->execute($params);
    return $st;
}

function now_ms(): int { return (int) round(microtime(true) * 1000); }

function uuid(): string {
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    $h = bin2hex($b);
    return substr($h, 0, 8) . '-' . substr($h, 8, 4) . '-' . substr($h, 12, 4) . '-' . substr($h, 16, 4) . '-' . substr($h, 20);
}

/* bcrypt only reads the first 72 bytes, so hash the password first to keep long passwords safe. */
function hash_pw(string $pw): string {
    return password_hash(base64_encode(hash('sha256', $pw, true)), PASSWORD_DEFAULT);
}
function verify_pw(string $pw, string $stored): bool {
    return password_verify(base64_encode(hash('sha256', $pw, true)), $stored);
}

function install_schema(): void {
    $pdo = db();
    $mysql = DB_DRIVER !== 'sqlite';
    $tail = $mysql ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci' : '';
    $pk = $mysql ? 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    $uid = $mysql ? 'INT UNSIGNED' : 'INTEGER';
    $uname = $mysql ? 'VARCHAR(20) NOT NULL' : 'TEXT NOT NULL COLLATE NOCASE';

    $tables = [
        "CREATE TABLE IF NOT EXISTS st_users (
            id $pk,
            username $uname,
            pass_hash VARCHAR(255) NOT NULL,
            role VARCHAR(10) NOT NULL DEFAULT 'user',
            settings TEXT NOT NULL,
            sess_ver INT NOT NULL DEFAULT 0,
            created_at BIGINT NOT NULL,
            last_seen BIGINT NOT NULL DEFAULT 0,
            last_page VARCHAR(20) NOT NULL DEFAULT '',
            UNIQUE (username)
        )$tail",
        /* type: deposit | withdraw | to_wallet | to_savings */
        "CREATE TABLE IF NOT EXISTS st_savings (
            id CHAR(36) NOT NULL PRIMARY KEY,
            user_id $uid NOT NULL,
            type VARCHAR(12) NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            date VARCHAR(10) NOT NULL,
            category VARCHAR(30) NOT NULL DEFAULT '',
            note VARCHAR(80) NOT NULL DEFAULT '',
            created_at BIGINT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        /* kind: expense | income. This is the wallet (daily money). */
        "CREATE TABLE IF NOT EXISTS st_money (
            id CHAR(36) NOT NULL PRIMARY KEY,
            user_id $uid NOT NULL,
            kind VARCHAR(8) NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            date VARCHAR(10) NOT NULL,
            category VARCHAR(30) NOT NULL DEFAULT 'Others',
            note VARCHAR(80) NOT NULL DEFAULT '',
            created_at BIGINT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_notes (
            id CHAR(36) NOT NULL PRIMARY KEY,
            user_id $uid NOT NULL,
            title VARCHAR(80) NOT NULL,
            subject VARCHAR(30) NOT NULL DEFAULT 'General',
            kind VARCHAR(12) NOT NULL DEFAULT 'assignment',
            due_date VARCHAR(10) NOT NULL DEFAULT '',
            due_time VARCHAR(5) NOT NULL DEFAULT '',
            body VARCHAR(2000) NOT NULL DEFAULT '',
            items TEXT NULL,
            done INT NOT NULL DEFAULT 0,
            done_date VARCHAR(10) NOT NULL DEFAULT '',
            created_at BIGINT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_tasks (
            id CHAR(36) NOT NULL PRIMARY KEY,
            user_id $uid NOT NULL,
            title VARCHAR(80) NOT NULL,
            date VARCHAR(10) NOT NULL,
            start_time VARCHAR(5) NOT NULL DEFAULT '',
            tag VARCHAR(20) NOT NULL DEFAULT 'Personal',
            done INT NOT NULL DEFAULT 0,
            done_date VARCHAR(10) NOT NULL DEFAULT '',
            created_at BIGINT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_requests (
            id $pk,
            tx_id CHAR(36) NOT NULL,
            user_id $uid NOT NULL,
            type VARCHAR(12) NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            date VARCHAR(10) NOT NULL,
            category VARCHAR(30) NOT NULL DEFAULT '',
            note VARCHAR(80) NOT NULL DEFAULT '',
            reason VARCHAR(200) NOT NULL DEFAULT '',
            status VARCHAR(10) NOT NULL DEFAULT 'pending',
            admin_note VARCHAR(200) NOT NULL DEFAULT '',
            created_at BIGINT NOT NULL,
            decided_at BIGINT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_activity (
            id $pk,
            user_id $uid NOT NULL,
            label VARCHAR(80) NOT NULL,
            created_at BIGINT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        /* journal: one row per entry. mood 1 (rough) to 5 (great). Private to the user. */
        "CREATE TABLE IF NOT EXISTS st_journal (
            id CHAR(36) NOT NULL PRIMARY KEY,
            user_id $uid NOT NULL,
            date VARCHAR(10) NOT NULL,
            mood INT NOT NULL DEFAULT 3,
            title VARCHAR(80) NOT NULL DEFAULT '',
            body TEXT NOT NULL,
            created_at BIGINT NOT NULL,
            updated_at BIGINT NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        /* lists: grocery, wishlist, packing... each list has checkable items */
        "CREATE TABLE IF NOT EXISTS st_lists (
            id CHAR(36) NOT NULL PRIMARY KEY,
            user_id $uid NOT NULL,
            title VARCHAR(40) NOT NULL,
            color VARCHAR(10) NOT NULL DEFAULT 'blue',
            icon VARCHAR(12) NOT NULL DEFAULT 'list',
            created_at BIGINT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_list_items (
            id CHAR(36) NOT NULL PRIMARY KEY,
            list_id CHAR(36) NOT NULL,
            user_id $uid NOT NULL,
            text VARCHAR(120) NOT NULL,
            done INT NOT NULL DEFAULT 0,
            created_at BIGINT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE,
            FOREIGN KEY (list_id) REFERENCES st_lists(id) ON DELETE CASCADE
        )$tail",
        /* chat: friend requests (a asked b) and messages. Media files live in chat_uploads/ and are only served to the two people in the chat. */
        "CREATE TABLE IF NOT EXISTS st_friends (
            id $pk,
            a $uid NOT NULL,
            b $uid NOT NULL,
            status VARCHAR(10) NOT NULL DEFAULT 'pending',
            created_at BIGINT NOT NULL,
            UNIQUE (a, b),
            FOREIGN KEY (a) REFERENCES st_users(id) ON DELETE CASCADE,
            FOREIGN KEY (b) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_chat (
            id $pk,
            from_id $uid NOT NULL,
            to_id $uid NOT NULL,
            kind VARCHAR(10) NOT NULL DEFAULT 'text',
            body TEXT NOT NULL,
            media VARCHAR(60) NOT NULL DEFAULT '',
            mime VARCHAR(30) NOT NULL DEFAULT '',
            created_at BIGINT NOT NULL,
            updated_at BIGINT NOT NULL,
            read_at BIGINT NOT NULL DEFAULT 0,
            group_id BIGINT NOT NULL DEFAULT 0,
            edited_at BIGINT NOT NULL DEFAULT 0,
            FOREIGN KEY (from_id) REFERENCES st_users(id) ON DELETE CASCADE,
            FOREIGN KEY (to_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_groups (
            id $pk,
            name VARCHAR(60) NOT NULL,
            owner_id $uid NOT NULL,
            created_at BIGINT NOT NULL,
            FOREIGN KEY (owner_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_group_members (
            group_id $uid NOT NULL,
            user_id $uid NOT NULL,
            joined_at BIGINT NOT NULL,
            last_read BIGINT NOT NULL DEFAULT 0,
            UNIQUE (group_id, user_id),
            FOREIGN KEY (group_id) REFERENCES st_groups(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_chat_rx (
            msg_id BIGINT NOT NULL,
            user_id $uid NOT NULL,
            emoji VARCHAR(16) NOT NULL,
            created_at BIGINT NOT NULL,
            UNIQUE (msg_id, user_id),
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_classes (
            id CHAR(36) NOT NULL PRIMARY KEY,
            user_id $uid NOT NULL,
            subject VARCHAR(40) NOT NULL,
            dow INT NOT NULL,
            start_time VARCHAR(5) NOT NULL,
            end_time VARCHAR(5) NOT NULL,
            room VARCHAR(20) NOT NULL DEFAULT '',
            color VARCHAR(10) NOT NULL DEFAULT 'blue',
            created_at BIGINT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_grades (
            id CHAR(36) NOT NULL PRIMARY KEY,
            user_id $uid NOT NULL,
            subject VARCHAR(40) NOT NULL,
            units DECIMAL(4,1) NOT NULL,
            grade DECIMAL(3,2) NOT NULL,
            term VARCHAR(20) NOT NULL DEFAULT '',
            created_at BIGINT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_budgets (
            user_id $uid NOT NULL,
            category VARCHAR(30) NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            PRIMARY KEY (user_id, category),
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_study (
            id CHAR(36) NOT NULL PRIMARY KEY,
            user_id $uid NOT NULL,
            date VARCHAR(10) NOT NULL,
            minutes INT NOT NULL,
            label VARCHAR(40) NOT NULL DEFAULT '',
            created_at BIGINT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES st_users(id) ON DELETE CASCADE
        )$tail",
        "CREATE TABLE IF NOT EXISTS st_login_attempts (
            k VARCHAR(40) NOT NULL PRIMARY KEY,
            n INT NOT NULL,
            window_start BIGINT NOT NULL
        )$tail",
    ];
    foreach ($tables as $sql) $pdo->exec($sql);

    $indexes = [
        'CREATE INDEX st_idx_savings_user ON st_savings (user_id, date)',
        'CREATE INDEX st_idx_money_user ON st_money (user_id, date)',
        'CREATE INDEX st_idx_notes_user ON st_notes (user_id, due_date)',
        'CREATE INDEX st_idx_tasks_user ON st_tasks (user_id, date)',
        'CREATE INDEX st_idx_requests_tx ON st_requests (tx_id, status)',
        'CREATE INDEX st_idx_requests_user ON st_requests (user_id)',
        'CREATE INDEX st_idx_activity_user ON st_activity (user_id, id)',
        'CREATE INDEX st_idx_journal_user ON st_journal (user_id, date)',
        'CREATE INDEX st_idx_lists_user ON st_lists (user_id)',
        'CREATE INDEX st_idx_items_list ON st_list_items (list_id)',
        'CREATE INDEX st_idx_chat_to ON st_chat (to_id, read_at)',
        'CREATE INDEX st_idx_chat_pair ON st_chat (from_id, to_id, id)',
        'CREATE INDEX st_idx_friends_b ON st_friends (b)',
        'CREATE INDEX st_idx_chat_group ON st_chat (group_id, id)',
        'CREATE INDEX st_idx_gm_user ON st_group_members (user_id)',
        'CREATE INDEX st_idx_classes_user ON st_classes (user_id, dow)',
        'CREATE INDEX st_idx_grades_user ON st_grades (user_id)',
        'CREATE INDEX st_idx_study_user ON st_study (user_id, date)',
    ];
    foreach ($indexes as $sql) {
        try { $pdo->exec($sql); } catch (PDOException $e) { /* already there */ }
    }
}

function admin_exists(): bool {
    return (bool) q("SELECT 1 FROM st_users WHERE role = 'admin' LIMIT 1")->fetch();
}

function default_settings(): array {
    return ['name' => '', 'course' => '', 'target' => 0, 'theme' => 'light', 'hide' => false, 'avatar' => ''];
}

function create_admin(string $password): void {
    q("INSERT INTO st_users (username, pass_hash, role, settings, created_at) VALUES ('admin', ?, 'admin', ?, ?)",
      [hash_pw($password), json_encode(default_settings()), now_ms()]);
}


/* Upgrades from an older version: creates any missing tables the first time the app loads, so setup.php does not need to be run again. */
function ensure_schema(): void {
    static $done = false;
    if ($done) return;
    $need = [['st_chat', 'group_id'], ['st_chat', 'edited_at'], ['st_notes', 'items'], ['st_chat_rx', 'msg_id'], ['st_study', 'id'], ['st_classes', 'id'], ['st_grades', 'id'], ['st_budgets', 'category']];
    $missing = false;
    foreach ($need as [$t, $c]) {
        try { q("SELECT $c FROM $t LIMIT 1")->fetch(); } catch (Throwable $e) { $missing = true; }
    }
    if (!$missing) { $done = true; return; }
    install_schema();
    $adds = [['st_chat', 'group_id', 'BIGINT NOT NULL DEFAULT 0'], ['st_chat', 'edited_at', 'BIGINT NOT NULL DEFAULT 0'], ['st_notes', 'items', 'TEXT NULL']];
    foreach ($adds as [$t, $c, $def]) {
        try { q("SELECT $c FROM $t LIMIT 1")->fetch(); }
        catch (Throwable $e) { try { q("ALTER TABLE $t ADD COLUMN $c $def"); } catch (Throwable $e2) { /* ignore */ } }
    }
    try { if (db()->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql') q("ALTER TABLE st_notes MODIFY body VARCHAR(2000) NOT NULL DEFAULT ''"); } catch (Throwable $e) { /* keeps working with the old size */ }
    $done = true;
}
