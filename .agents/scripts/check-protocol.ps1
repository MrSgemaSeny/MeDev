$inputJson = [Console]::In.ReadToEnd()

$lockFile = "$env:TEMP\check-protocol-attempts.txt"

# Read current attempt count
$attempts = 0
if (Test-Path $lockFile) {
    $lastWrite = (Get-Item $lockFile).LastWriteTime
    # Reset counter if last attempt was more than 5 minutes ago (new session)
    if ((Get-Date) - $lastWrite -gt [TimeSpan]::FromMinutes(5)) {
        Remove-Item $lockFile -Force
    } else {
        $attempts = [int](Get-Content $lockFile -ErrorAction SilentlyContinue)
    }
}

# After 3 attempts, let the agent stop to avoid burning tokens
if ($attempts -ge 3) {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    $response = @{ decision = "stop" }
    $response | ConvertTo-Json -Compress | Write-Output
    exit
}

# 1. Check MeDev (current repo)
$medevStatus = git status --porcelain
$medevUnpushed = git cherry -v 2>$null

# 2. Check Second-Brain
Push-Location "..\Brain's protocol - second brain"
$brainStatus = git status --porcelain
$brainUnpushed = git cherry -v 2>$null
Pop-Location

if ($medevStatus -or $medevUnpushed -or $brainStatus -or $brainUnpushed) {
    $attempts++
    Set-Content -Path $lockFile -Value $attempts
    $reason = "[CRITICAL] PROTOCOL VIOLATION: You have uncommitted or unpushed changes in MeDev or Second-Brain! You MUST update the journal, run git add/commit, and push both repositories to remote before stopping."
    $response = @{
        decision = "continue"
        reason = $reason
    }
    $response | ConvertTo-Json -Compress | Write-Output
} else {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    $response = @{ decision = "stop" }
    $response | ConvertTo-Json -Compress | Write-Output
}
