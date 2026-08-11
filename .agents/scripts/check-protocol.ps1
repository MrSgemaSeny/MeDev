$inputJson = [Console]::In.ReadToEnd()

# 1. Check MeDev (current repo)
$medevStatus = git status --porcelain
$medevUnpushed = git cherry -v 2>$null

# 2. Check Second-Brain
Push-Location "..\Brain's protocol - second brain"
$brainStatus = git status --porcelain
$brainUnpushed = git cherry -v 2>$null
Pop-Location

if ($medevStatus -or $medevUnpushed -or $brainStatus -or $brainUnpushed) {
    # If there are changes in either repo, force the agent to continue and explain why
    $reason = "[CRITICAL] PROTOCOL VIOLATION: You have uncommitted or unpushed changes in MeDev or Second-Brain! You MUST update the journal, run git add/commit, and push both repositories to remote before stopping."
    $response = @{
        decision = "continue"
        reason = $reason
    }
    $response | ConvertTo-Json -Compress | Write-Output
} else {
    # If everything is clean and pushed, allow stop
    $response = @{
        decision = "stop"
    }
    $response | ConvertTo-Json -Compress | Write-Output
}
