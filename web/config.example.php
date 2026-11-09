<?php
/*
 * Copy this file to config.php and fill in your own details.
 * NEVER upload config.php to GitHub. It is already listed in .gitignore.
 */

// 'mysql' for InfinityFree or XAMPP. 'sqlite' for quick testing on a PC.
define('DB_DRIVER', 'mysql');
define('DB_HOST', 'sqlXXX.infinityfree.com');   // shown in your hosting's MySQL Databases page
define('DB_NAME', 'epiz_00000000_studenttrack');
define('DB_USER', 'epiz_00000000');
define('DB_PASS', 'your-database-password');
define('DB_FILE', __DIR__ . '/studenttrack.sqlite');   // sqlite only

define('TIMEZONE', 'Asia/Manila');

// A secret word (6 or more characters) used only by setup.php. Delete setup.php after setup.
define('SETUP_KEY', '');

// Optional: if you set a code, people must enter it to sign up.
define('SIGNUP_CODE', '');

// Optional: a free key from developers.giphy.com to enable GIF search in chat.
// define('GIPHY_KEY', '');
