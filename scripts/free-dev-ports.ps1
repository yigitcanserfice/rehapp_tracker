$ports = @(3000, 3001)
$connections = Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue
$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $processIds) {
  if ($processId -and $processId -ne $PID) {
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process -and $process.ProcessName -eq "node") {
      Write-Host "Stopping stale dev server on port $($connections | Where-Object OwningProcess -eq $processId | Select-Object -ExpandProperty LocalPort -Unique)..."
      Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
  }
}
