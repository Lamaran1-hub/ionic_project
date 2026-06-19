# Libère les ports ResaGuinée puis démarre les émulateurs Firebase
$ports = @(9099, 8390, 4000, 4400)

Write-Host "Arret des processus sur les ports emulateurs ResaGuinee ($($ports -join ', '))..." -ForegroundColor Cyan

foreach ($port in $ports) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($conn in $connections) {
    $processId = $conn.OwningProcess
    $name = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
    Write-Host "  Port $port -> PID $processId ($name)" -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  }
}

Start-Sleep -Seconds 2

Write-Host "Demarrage: firebase emulators:start" -ForegroundColor Green
Set-Location $PSScriptRoot\..
firebase emulators:start
