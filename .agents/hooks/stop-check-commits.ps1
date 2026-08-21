$status = git status --porcelain
if ($status) {
    $out = @{
        decision = "continue"
        reason = "Внимание: у вас есть незакоммиченные изменения! Вы забыли сделать git add, git commit и обновить журнал (Second Brain). Пожалуйста, сделайте это перед завершением работы."
    }
    $out | ConvertTo-Json -Compress | Write-Output
} else {
    $out = @{
        decision = "stop"
    }
    $out | ConvertTo-Json -Compress | Write-Output
}
