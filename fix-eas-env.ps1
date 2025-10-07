# ===========================================
# Script: fix-eas-env.ps1
# Funcao: Corrige ambiente EAS/Expo (Node 20 + EAS CLI) e roda build de teste
# ===========================================

Write-Host "Verificando ambiente Node + EAS..."

function Download-File($url, $path) {
    Write-Host "Baixando $url ..."
    $wc = New-Object System.Net.WebClient
    $wc.DownloadFile($url, $path)
}

# 1. Verifica se o NVM esta instalado
$nvmPath = "$env:APPDATA\nvm\nvm.exe"
if (-not (Test-Path $nvmPath)) {
    Write-Host "NVM nao encontrado. Instalando..."
    $installer = "$env:TEMP\nvm-setup.exe"
    Download-File "https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.exe" $installer
    Start-Process -FilePath $installer -Wait
    Write-Host "NVM instalado com sucesso."
} else {
    Write-Host "NVM ja instalado."
}

# 2. Atualiza PATH do NVM
Write-Host "Atualizando PATH do NVM..."
$env:PATH = "$env:APPDATA\nvm;$env:PATH"

# 3. Verifica Node 20.15.1
$nodeVersion = (& nvm list 2>$null | Select-String "20.15.1")
if (-not $nodeVersion) {
    Write-Host "Instalando Node 20.15.1 (LTS recomendado)..."
    nvm install 20.15.1
} else {
    Write-Host "Node 20.15.1 ja esta instalado."
}

# 4. Ativa Node 20.15.1
Write-Host "Ativando Node 20.15.1..."
nvm use 20.15.1

# 5. Mostra versoes
Write-Host ""
Write-Host "Node version:" (node -v)
Write-Host "NPM version:" (npm -v)
Write-Host ""

# 6. Reinstala o EAS CLI
Write-Host "Reinstalando EAS CLI..."
npm uninstall -g eas-cli
npm install -g eas-cli@latest

# 7. Testa se o EAS foi instalado
Write-Host ""
Write-Host "EAS CLI instalado com sucesso."
$easVersion = eas --version
Write-Host "Versao do EAS: $easVersion"

# 8. Roda teste de build com log
Write-Host ""
Write-Host "Rodando teste de build com EAS UPDATE..."
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logPath = "$PSScriptRoot\eas_debug_auto_$timestamp.log"

try {
    $env:NODE_OPTIONS = "--max-old-space-size=4096 --trace-deprecation"
    eas update 2>&1 | Tee-Object -FilePath $logPath
    Write-Host ""
    Write-Host "Build concluido. Log salvo em: $logPath"
    Start-Process notepad.exe $logPath
}
catch {
    Write-Host "Erro ao rodar EAS UPDATE:"
    Write-Host $_.Exception.Message
    if (Test-Path $logPath) {
        Start-Process notepad.exe $logPath
    }
}

Write-Host ""
Write-Host "Processo finalizado. Verifique o log para detalhes do build."
