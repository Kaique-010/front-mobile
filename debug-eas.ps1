# ===========================================
# Script: debug-eas.ps1
# Função: Executa EAS Update com debug e abre o log automaticamente
# Compatível com PowerShell 5+
# ===========================================

# Configura o Node com mais memória e rastreamento
$env:NODE_OPTIONS = "--max-old-space-size=4096 --trace-deprecation"

# Define caminho do log com timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logPath = "$PSScriptRoot\eas_debug_$timestamp.log"

Write-Host "Iniciando EAS Update com debug detalhado..."
Write-Host "O log sera salvo em: $logPath"
Write-Host ""

try {
    # Executa o EAS Update e salva toda a saída no log
    # (sem usar o parâmetro -Encoding)
    eas update 2>&1 | Tee-Object -FilePath $logPath

    Write-Host ""
    Write-Host "Execucao concluida. Abrindo o log no Bloco de Notas..."
    Start-Process notepad.exe $logPath
}
catch {
    Write-Host ""
    Write-Host "Erro ao executar EAS Update:"
    Write-Host $_.Exception.Message
    if (Test-Path $logPath) {
        Start-Process notepad.exe $logPath
    }
}
