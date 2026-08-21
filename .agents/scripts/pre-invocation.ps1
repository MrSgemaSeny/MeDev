$inputJson = [Console]::In.ReadToEnd() | ConvertFrom-Json

if ($inputJson.invocationNum -ne 1) {
    @{ injectSteps = @() } | ConvertTo-Json -Compress | Write-Output
    exit
}

$injectSteps = @()

$contextMd = "CONTEXT.md"
if (Test-Path $contextMd) {
    $content = Get-Content $contextMd -Raw
    $injectSteps += @{ ephemeralMessage = "[AUTO-INJECTED] CONTENTS OF $contextMd:`n$content" }
}

$brainDir = "..\..\Brain's protocol - second brain\context"
if (Test-Path $brainDir) {
    foreach ($file in Get-ChildItem -Path $brainDir -Filter "*.md") {
        $content = Get-Content $file.FullName -Raw
        $injectSteps += @{ ephemeralMessage = "[AUTO-INJECTED SECOND BRAIN] $($file.Name):`n$content" }
    }
}

@{ injectSteps = $injectSteps } | ConvertTo-Json -Depth 10 -Compress | Write-Output
