plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val siteUrl: String = (project.findProperty("siteUrl") as String?)?.trim().takeUnless { it.isNullOrEmpty() }
    ?: "https://studenttrack.infinityfreeapp.com/"

android {
    namespace = "com.studenttrack.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.studenttrack.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        buildConfigField("String", "SITE_URL", "\"$siteUrl\"")
    }

    // Same keystore on every build so the app can be updated without uninstalling.
    signingConfigs {
        getByName("debug") {
            storeFile = rootProject.file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
}
