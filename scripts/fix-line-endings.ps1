# PowerShell script to fix line endings in all markdown files

Write-Host "Normalizing line endings in markdown files..." -ForegroundColor Green

# Find all markdown files and convert CRLF to LF
Get-ChildItem -Path . -Recurse -Filter "*.md" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content) {
        # Replace CRLF with LF
        $content = $content -replace "`r`n", "`n"
        # Remove any remaining CR characters
        $content = $content -replace "`r", ""
        # Write back with LF line endings
        [System.IO.File]::WriteAllText($_.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Fixed: $($_.Name)" -ForegroundColor Yellow
    }
}

Write-Host "Done! All markdown files now have LF line endings." -ForegroundColor Green