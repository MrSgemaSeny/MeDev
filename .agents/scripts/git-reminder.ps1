$inputJson = [Console]::In.ReadToEnd() | ConvertFrom-Json

$injectSteps = @()

$medevStatus = git status --porcelain
$medevUnpushed = git cherry -v 2>$null

Push-Location "..\..\Brain's protocol - second brain"
$brainStatus = git status --porcelain
$brainUnpushed = git cherry -v 2>$null
Pop-Location

if ($medevStatus -or $medevUnpushed -or $brainStatus -or $brainUnpushed) {
    $reason = "[WARNING] Не забывай про Workflow: ТЕСТЫ → ЖУРНАЛ → GIT PUSH. У тебя есть незакоммиченные или неотправленные изменения. Ты можешь остановиться, чтобы задать вопрос пользователю, но НЕ ЗАБУДЬ сделать push перед финальным завершением задачи!"
    $injectSteps += @{ ephemeralMessage = $reason }
}

@{ injectSteps = $injectSteps } | ConvertTo-Json -Depth 10 -Compress | Write-Output
