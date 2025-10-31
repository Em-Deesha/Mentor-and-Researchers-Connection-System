param($file)
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace 'demo@academic-match\.com', 'DEMO_EMAIL_REMOVED'
    $content = $content -replace 'demo123', 'DEMO_PASSWORD_REMOVED'
    $content = $content -replace 'firebase-user@academic-matchmaker\.com', 'DEMO_EMAIL_REMOVED'
    $content = $content -replace 'firebase-auth-bridge', 'DEMO_PASSWORD_REMOVED'
    Set-Content -Path $file -Value $content -NoNewline
}

