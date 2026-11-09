# StudentTrack

A free, open-source web app for students: **savings**, **notes and assignments**, **spending**, **class schedule**, **study timer**, **grades / GWA**, **journal**, **lists** and **chat** (friends, group chats, stickers, emoji, pictures and video). Every user has their own account, and there is an admin.

Built with **PHP 8.1+ and MySQL**, so it runs on free hosting such as InfinityFree. An **Android app (Kotlin)** that opens your site is included.

## What is in this repo

| Folder | What it is |
|---|---|
| `web/` | The whole website. This is what you upload to your hosting |
| `android/` | A small Kotlin app with a WebView, used to build the APK |
| `.github/workflows/android.yml` | Builds the APK automatically on GitHub |

> GitHub cannot run PHP. The website and database run on your own hosting. GitHub is for the code and for downloading the APK.

## 1. Install the website (InfinityFree or XAMPP)

1. Create a MySQL database on your hosting (on InfinityFree: **MySQL Databases**). Note the host, database name, user and password.
2. Inside `web/`, copy `config.example.php` to **`config.php`** and fill in your details. Put a secret word in `SETUP_KEY`.
3. Upload the **contents** of `web/` to the `htdocs` folder of your hosting.
4. Open `https://your-site/setup.php`, enter the secret word and choose an **admin password**.
5. **Delete `setup.php`** from the hosting.
6. Log in as `admin`. Everyone else uses **Sign up**.

**Never commit `config.php`.** It holds your database password. It is already listed in `.gitignore`, but double-check before you push.

### Updating
Upload the changed files again and keep your own `config.php`. Because the site has a service worker, press Ctrl+F5 if the new version does not show up.

### Install as an app (PWA)
On your phone, open the site in Chrome and choose **⋮ → Install app**, or go to **Profile → App & alerts**.

## 2. Android APK

### For users
1. Open **Releases** in this repo and download `StudentTrack.apk`.
2. Open it on your phone. Android will ask you to allow **Install unknown apps** for your browser or file manager. This is normal because the app is not on the Play Store.

### For the maintainer
The APK is built on GitHub Actions, so you do not need Android Studio.

1. (Only if your site URL is different) go to **Settings → Secrets and variables → Actions → Variables → New repository variable** and set `SITE_URL` to `https://your-site.com/`.
2. Publish a release:
   ```bash
   git tag v1.0
   git push origin v1.0
   ```
   Or open **Actions → Build Android APK → Run workflow**.
3. A few minutes later, `StudentTrack.apk` appears under **Releases**.

The APK is a wrapper around the website. When you upload new web files, the app shows them right away, so you do not need a new APK for every change.

To build it on your own computer, open the `android/` folder in Android Studio, or run `gradle assembleDebug`.

### Limitations of the APK
- It needs an internet connection. Offline support is minimal.
- **Browser alerts do not work inside the APK** (Profile → alerts). They work in Chrome and in the installed PWA.
- The APK is signed with the debug key included in the repo, so updates install over older versions without uninstalling. It is not meant for the Play Store. For the Play Store, create your own release key.

## Features
- Savings: deposit, withdraw, transfer, advance deposits, goal, chart. Deleting a transaction needs admin approval.
- Separate spending and income, with monthly budgets per category and warnings.
- Notes and assignments with due dates, checklists, view and edit.
- Tasks, calendar, class schedule, study timer (Pomodoro) that counts toward your streak, grades and GWA, journal, lists.
- Chat: friend requests, group chats, pictures, video (with a size limit), GIF files, stickers, emoji, reactions, edit and unsend, online status, info panel, sharing tasks and notes.
- JSON and CSV backup, dark and light theme, hover effects and tooltips on desktop.
- Admin: see who is online and review requests.

## Security
- Keep `config.php` private and never upload it to GitHub. If you did by mistake, change your database password right away.
- Delete `setup.php` after setup.
- Chats are private to the people in them. The admin cannot read them in the app.

## License
MIT. See [LICENSE](LICENSE).
