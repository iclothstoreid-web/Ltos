# LTOS Repository Audit Script (Windows PowerShell)
# Run: .\audit.ps1

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "LTOS REPOSITORY AUDIT -- Windows PowerShell" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# 1. ROOT FILES
Write-Host "1. ROOT FILES" -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray
Get-ChildItem -Path . -Depth 0 -Force | Where-Object { $_.Attributes -ne "Directory" } | ForEach-Object { Write-Host $_.Name }
Write-Host ""

# 2. FOLDER STRUCTURE
Write-Host "2. FOLDER STRUCTURE" -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray

$exclude = @('node_modules', '.next', '.git', '.vscode', 'dist', '.turbo', 'out')

function Get-FolderTree {
    param([string]$Path, [int]$Depth = 0, [int]$MaxDepth = 3)
    
    if ($Depth -gt $MaxDepth) {
        return
    }
    
    $indent = "  " * $Depth
    $items = Get-ChildItem -Path $Path -ErrorAction SilentlyContinue | Where-Object { $_.Name -notin $exclude }
    
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            Write-Host "$indent`+-- $($item.Name)/" -ForegroundColor Gray
            Get-FolderTree -Path $item.FullName -Depth ($Depth + 1) -MaxDepth $MaxDepth
        }
        else {
            Write-Host "$indent`+-- $($item.Name)" -ForegroundColor Gray
        }
    }
}

Write-Host "./" -ForegroundColor Yellow
Get-FolderTree -Path "." -Depth 0

Write-Host ""

# 3. PACKAGE.JSON
Write-Host "3. PACKAGE.JSON" -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray
if (Test-Path "package.json") {
    $packageJson = Get-Content -Path "package.json" -Raw
    Write-Host $packageJson -ForegroundColor White
}
else {
    Write-Host "[-] package.json not found" -ForegroundColor Red
}
Write-Host ""

# 4. APP / PAGES / SRC STRUCTURE
Write-Host "4. EXISTING ROUTES STRUCTURE" -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray

$routePaths = @("app", "pages", "src")
$routeFound = $false

foreach ($routePath in $routePaths) {
    if (Test-Path $routePath) {
        Write-Host "[+] Found: $routePath/" -ForegroundColor Yellow
        $routeFound = $true
        
        $files = Get-ChildItem -Path $routePath -Recurse -Include "*.tsx", "*.ts", "*.jsx", "*.js" -ErrorAction SilentlyContinue
        
        if ($files) {
            Write-Host ""
            foreach ($file in $files) {
                $relativePath = $file.FullName -replace [regex]::Escape((Get-Location).Path), "."
                Write-Host "  $relativePath" -ForegroundColor Gray
            }
        }
        Write-Host ""
    }
}

if (-not $routeFound) {
    Write-Host "[-] No app/, pages/, or src/ directory found" -ForegroundColor Red
}

Write-Host ""

# 5. CONFIG FILES
Write-Host "5. CONFIG FILES" -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray

$configFiles = @(
    "tsconfig.json",
    "next.config.js",
    "next.config.ts",
    "next.config.mjs",
    "tailwind.config.js",
    "tailwind.config.ts",
    ".eslintrc.json",
    ".eslintrc.js",
    "prettier.config.js",
    "prettier.config.json",
    "postcss.config.js"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "[+] $file" -ForegroundColor Green
    }
}

Write-Host ""

# 6. TSCONFIG.JSON
Write-Host "6. TSCONFIG.JSON CONTENT" -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray
if (Test-Path "tsconfig.json") {
    $tsconfig = Get-Content -Path "tsconfig.json" -Raw
    Write-Host $tsconfig -ForegroundColor White
}
else {
    Write-Host "[-] tsconfig.json not found" -ForegroundColor Red
}
Write-Host ""

# 7. NEXT.CONFIG
Write-Host "7. NEXT.CONFIG CONTENT" -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray
$nextConfigs = @("next.config.js", "next.config.ts", "next.config.mjs")
$foundConfig = $false
foreach ($file in $nextConfigs) {
    if (Test-Path $file) {
        Write-Host "File: $file" -ForegroundColor Yellow
        $content = Get-Content -Path $file -Raw
        Write-Host $content -ForegroundColor White
        $foundConfig = $true
        break
    }
}
if (-not $foundConfig) {
    Write-Host "[-] No next.config found" -ForegroundColor Red
}
Write-Host ""

# 8. .ENV.EXAMPLE
Write-Host "8. .ENV.EXAMPLE" -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray
if (Test-Path ".env.example") {
    $env = Get-Content -Path ".env.example"
    Write-Host $env -ForegroundColor White
}
else {
    Write-Host "[-] .env.example not found" -ForegroundColor Red
}
Write-Host ""

# 9. README
Write-Host "9. README.md (First 50 lines)" -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray
if (Test-Path "README.md") {
    $readme = Get-Content -Path "README.md" -TotalCount 50
    Write-Host ($readme | Out-String) -ForegroundColor White
}
else {
    Write-Host "[-] README.md not found" -ForegroundColor Red
}
Write-Host ""

# 10. SUPABASE INTEGRATION
Write-Host "10. SUPABASE INTEGRATION (Search in code)" -ForegroundColor Green
Write-Host "---" -ForegroundColor Gray

$searchPaths = @("app", "pages", "src", "lib")
$found = $false
$supabasePattern = "supabase"

foreach ($searchPath in $searchPaths) {
    if (Test-Path $searchPath) {
        $supabaseFiles = Get-ChildItem -Path $searchPath -Recurse -Include "*.tsx", "*.ts", "*.jsx", "*.js" -ErrorAction SilentlyContinue | Where-Object { (Get-Content $_ | Select-String -Pattern $supabasePattern -ErrorAction SilentlyContinue) }
        
        if ($supabaseFiles) {
            $found = $true
            foreach ($file in $supabaseFiles) {
                $relativePath = $file.FullName -replace [regex]::Escape((Get-Location).Path), "."
                Write-Host "[+] $relativePath" -ForegroundColor Green
                
                $content = Get-Content -Path $file.FullName
                $lineNum = 1
                foreach ($line in $content) {
                    if ($line -match $supabasePattern) {
                        Write-Host "  Line $lineNum : $line" -ForegroundColor Gray
                    }
                    $lineNum++
                }
            }
        }
    }
}

if (-not $found) {
    Write-Host "[-] No Supabase integration found" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "AUDIT COMPLETE" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan