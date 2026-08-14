$inputJson = $input | Out-String
if ([string]::IsNullOrWhiteSpace($inputJson)) {
    Write-Output "{}"
    exit 0
}

$payload = $inputJson | ConvertFrom-Json

# Запускаем только на самом первом шаге сессии
if ($payload.invocationNum -eq 1) {
    $response = @{
        injectSteps = @(
            @{
                ephemeralMessage = "🔴 CRITICAL INITIALIZATION SEQUENCE: Это новая сессия. ДО ТОГО, как отвечать пользователю или писать код, ты ОБЯЗАН вызвать view_file для файлов .agents/CONTEXT.md и файлов из папки context/ (me.md, projects.md, rules.md). Это жесткое требование системы Brain's Protocol. Выполни чтение прямо сейчас."
            }
        )
    }
    $response | ConvertTo-Json -Depth 5 -Compress | Write-Output
} else {
    Write-Output "{}"
}
