$inputJson = $input | Out-String
if ([string]::IsNullOrWhiteSpace($inputJson)) {
    Write-Output "{}"
    exit 0
}

$payload = $inputJson | ConvertFrom-Json

if ($payload.toolCall.name -ne "run_command") {
    Write-Output "{}"
    exit 0
}

$cmd = $payload.toolCall.args.CommandLine
if ([string]::IsNullOrWhiteSpace($cmd)) {
    Write-Output "{}"
    exit 0
}

# Запрещаем cat, grep, sed, ls, а также все модифицирующие git команды
$forbiddenPattern = "(?i)^\s*(cat|grep|sed|ls|git\s+(commit|push|checkout|add|reset|rebase|merge|stash))\b"

if ($cmd -match $forbiddenPattern) {
    $response = @{
        decision = "deny"
        reason = "🔴 FATAL ERROR: CRITICAL INSTRUCTION VIOLATION. Внимание Агент! Ты попытался запустить запрещенную команду ('$cmd'). ПРАВИЛА: 1) ЗАПРЕЩЕНО использовать cat/grep/sed/ls через терминал. Используй ТОЛЬКО list_dir, view_file, grep_search, replace_file_content. 2) ЗАПРЕЩЕНО трогать Git (commit, push и т.д.) - это делает только юзер. ОТМЕНИ СВОИ ДЕЙСТВИЯ И ИСПОЛЬЗУЙ ПРАВИЛЬНЫЕ ТУЛЗЫ."
    }
    $response | ConvertTo-Json -Compress | Write-Output
} else {
    $response = @{ decision = "allow" }
    $response | ConvertTo-Json -Compress | Write-Output
}
