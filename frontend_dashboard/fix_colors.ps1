$dir = "c:\Users\samue\OneDrive\Área de Trabalho\SFS1\SIMPA\frontend_dashboard\js\pages"
$files = Get-ChildItem -Path "$dir\*.js"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    if ($content -match 'background:#F6F6F6') {
        $content = $content -replace 'background:#F6F6F6', 'background:var(--bg-card)'
        $changed = $true
    }
    if ($content -match 'color:#003D61') {
        $content = $content -replace 'color:#003D61', 'color:var(--text-main)'
        $changed = $true
    }
    if ($content -match 'color:#404040') {
        $content = $content -replace 'color:#404040', 'color:var(--text-strong)'
        $changed = $true
    }
    if ($content -match 'background:#3FA9F5; color:#ffffff;') {
        $content = $content -replace 'background:#3FA9F5; color:#ffffff;', 'background:var(--blue-primary); color:var(--bg-page);'
        $changed = $true
    }
    if ($content -match 'background:#004D7B') {
        $content = $content -replace 'background:#004D7B', 'background:var(--blue-deep)'
        $changed = $true
    }
    if ($content -match 'background:#003D61') {
        $content = $content -replace 'background:#003D61', 'background:var(--blue-sidebar)'
        $changed = $true
    }
    if ($content -match 'border:1px solid #E3E3E3') {
        $content = $content -replace 'border:1px solid #E3E3E3', 'border:1px solid var(--border-color)'
        $changed = $true
    }
    if ($content -match '#E3E3E3') {
        $content = $content -replace '#E3E3E3', 'var(--bg-page)'
        $changed = $true
    }
    if ($content -match '#FFFFFF') {
        $content = $content -replace '#FFFFFF', 'var(--bg-card)'
        $changed = $true
    }
    if ($content -match 'fill="#404040"') {
        $content = $content -replace 'fill="#404040"', 'fill="currentColor"'
        $changed = $true
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed $($file.Name)"
    }
}
