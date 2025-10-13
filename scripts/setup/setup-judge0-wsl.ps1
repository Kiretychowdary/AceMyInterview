# Judge0 WSL2 Setup Launcher for Windows
# Run this from Windows PowerShell to set up Judge0 in WSL2

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Judge0 WSL2 Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if WSL2 is installed
Write-Host "Checking WSL2..." -ForegroundColor Yellow
$wslCheck = wsl --list --verbose 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ WSL2 is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To install WSL2, run in Administrator PowerShell:" -ForegroundColor Yellow
    Write-Host "  wsl --install" -ForegroundColor White
    Write-Host ""
    Write-Host "Then restart your computer and run this script again."
    exit 1
}

Write-Host "✅ WSL2 is installed" -ForegroundColor Green
Write-Host ""

# Show WSL2 distributions
Write-Host "Available WSL2 distributions:" -ForegroundColor Yellow
wsl --list --verbose
Write-Host ""

# Check if Ubuntu is running
$ubuntuRunning = wsl --list --verbose | Select-String "Ubuntu.*Running"

if ($ubuntuRunning) {
    Write-Host "✅ Ubuntu is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Starting Ubuntu..." -ForegroundColor Yellow
    wsl --distribution Ubuntu
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setting up Judge0 in WSL2..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Make script executable and run it in WSL2
$scriptPath = "/mnt/c/Users/kiret/Downloads/AceMyInterview/scripts/setup/setup-judge0-wsl.sh"

Write-Host "Running setup script in WSL2..." -ForegroundColor Yellow
Write-Host ""

wsl bash -c "chmod +x '$scriptPath' && '$scriptPath'"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "✅ Setup Complete!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Judge0 is now running in WSL2!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Keep this WSL2 terminal running" -ForegroundColor White
    Write-Host "2. Start your frontend in Windows:" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host "3. Test compiler in your app" -ForegroundColor White
    Write-Host ""
    Write-Host "To stop Judge0:" -ForegroundColor Cyan
    Write-Host "   wsl bash -c 'cd /mnt/c/Users/kiret/Downloads/AceMyInterview/config/docker && docker-compose -f docker-compose-judge0-wsl.yml down'" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Setup failed. Check the error messages above." -ForegroundColor Red
    Write-Host ""
    Write-Host "To manually set up, open WSL2 and run:" -ForegroundColor Yellow
    Write-Host "  cd /mnt/c/Users/kiret/Downloads/AceMyInterview" -ForegroundColor White
    Write-Host "  bash scripts/setup/setup-judge0-wsl.sh" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
