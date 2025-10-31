# ===================================================================
# 🧹 CLEANUP SCRIPT: Remove Unused Files and Folders
# ===================================================================
# This script removes all unused files and folders from the project
# Run with: powershell -ExecutionPolicy Bypass -File CLEANUP_UNUSED_FILES.ps1
# ===================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CLEANUP: Removing Unused Files" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$rootPath = "C:\Users\kiret\Downloads\AceMyInterview"
Set-Location $rootPath

# Track deletions
$deletedFolders = @()
$deletedFiles = @()
$totalSizeSaved = 0

# Function to calculate folder size
function Get-FolderSize {
    param([string]$path)
    if (Test-Path $path) {
        $size = (Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        return [math]::Round($size / 1MB, 2)
    }
    return 0
}

# Function to delete folder
function Remove-FolderSafely {
    param([string]$path, [string]$name)
    if (Test-Path $path) {
        $size = Get-FolderSize $path
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host "OK Deleted: $name ($size MB)" -ForegroundColor Green
            $script:deletedFolders += $name
            $script:totalSizeSaved += $size
        } catch {
            Write-Host "ERROR Failed to delete: $name - $_" -ForegroundColor Red
        }
    } else {
        Write-Host "WARNING Not found: $name" -ForegroundColor Yellow
    }
}

# Function to delete file
function Remove-FileSafely {
    param([string]$path, [string]$name)
    if (Test-Path $path) {
        try {
            $size = [math]::Round((Get-Item $path).Length / 1KB, 2)
            Remove-Item -Path $path -Force -ErrorAction Stop
            Write-Host "OK Deleted: $name ($size KB)" -ForegroundColor Green
            $script:deletedFiles += $name
        } catch {
            Write-Host "ERROR Failed to delete: $name - $_" -ForegroundColor Red
        }
    } else {
        Write-Host "WARNING Not found: $name" -ForegroundColor Yellow
    }
}

Write-Host "Removing UNUSED FOLDERS..." -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Delete unused folders
Remove-FolderSafely "$rootPath\judge0" "judge0/"
Remove-FolderSafely "$rootPath\judge0-env" "judge0-env/"
Remove-FolderSafely "$rootPath\functions" "functions/"
Remove-FolderSafely "$rootPath\config\docker" "config/docker/"
Remove-FolderSafely "$rootPath\scripts\setup" "scripts/setup/"
Remove-FolderSafely "$rootPath\scripts\legacy" "scripts/legacy/"
Remove-FolderSafely "$rootPath\scripts\health" "scripts/health/"
Remove-FolderSafely "$rootPath\public\models" "public/models/"

Write-Host "`nRemoving UNUSED FILES..." -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Delete unused files
Remove-FileSafely "$rootPath\get-docker.sh" "get-docker.sh"
Remove-FileSafely "$rootPath\firebase.json" "firebase.json"
Remove-FileSafely "$rootPath\netlify.toml" "netlify.toml"

# Delete Judge0-related documentation
Write-Host "`nRemoving JUDGE0-RELATED DOCS..." -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

Remove-FileSafely "$rootPath\docs\JUDGE0_INTEGRATION_GUIDE.md" "docs/JUDGE0_INTEGRATION_GUIDE.md"
Remove-FileSafely "$rootPath\docs\JUDGE0_SETUP_GUIDE.md" "docs/JUDGE0_SETUP_GUIDE.md"
Remove-FileSafely "$rootPath\docs\JUDGE0_WSL2_SETUP.md" "docs/JUDGE0_WSL2_SETUP.md"
Remove-FileSafely "$rootPath\docs\NETLIFY_DEPLOYMENT_FIX.md" "docs/NETLIFY_DEPLOYMENT_FIX.md"
Remove-FileSafely "$rootPath\docs\FIREBASE_DEPLOYMENT_GUIDE.md" "docs/FIREBASE_DEPLOYMENT_GUIDE.md"

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Folders Deleted: $($deletedFolders.Count)" -ForegroundColor Green
foreach ($folder in $deletedFolders) {
    Write-Host "   • $folder" -ForegroundColor Gray
}

Write-Host "`nFiles Deleted: $($deletedFiles.Count)" -ForegroundColor Green
foreach ($file in $deletedFiles) {
    Write-Host "   • $file" -ForegroundColor Gray
}

Write-Host "`nTotal Space Saved: ~$totalSizeSaved MB`n" -ForegroundColor Yellow

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Create cleanup log
$logContent = @"
# CLEANUP LOG - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Deleted Folders ($($deletedFolders.Count))
$($deletedFolders | ForEach-Object { "- $_" } | Out-String)

## Deleted Files ($($deletedFiles.Count))
$($deletedFiles | ForEach-Object { "- $_" } | Out-String)

## Space Saved
Total: ~$totalSizeSaved MB

## Remaining Project Structure
Only **ACTIVE** files and folders remain:
- backend/ - Express server with MongoDB
- src/ - React frontend application
- public/ - Static assets
- docs/ - Active documentation only
- config/ - Application configurations
- Root config files (vite, tailwind, etc.)
"@

$logContent | Out-File -FilePath "$rootPath\CLEANUP_LOG.txt" -Encoding UTF8
Write-Host "Cleanup log saved to: CLEANUP_LOG.txt`n" -ForegroundColor Cyan
