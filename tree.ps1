function Show-Tree($path, $prefix = '', $basePath = $null) {
    if (-not $basePath) {
        $basePath = (Get-Item $path).FullName
    }

    Get-ChildItem -Path $path | ForEach-Object {
        if ($_.PSIsContainer -and ($_.Name -in @("node_modules", ".next"))) {
            return
        }

        $relativePath = $_.FullName.Substring($basePath.Length).TrimStart('\')

        Write-Output "$prefix├── $relativePath"

        if ($_.PSIsContainer) {
            Show-Tree -path $_.FullName -prefix "$prefix│   " -basePath $basePath
        }
    }
}

# Altere este caminho abaixo caso o diretório não esteja no mesmo local
Show-Tree ".\"