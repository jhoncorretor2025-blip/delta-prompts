@echo off
chcp 65001 >nul
title Clonagem de Voz Master - Servidor no meu PC (v1.5.23)
cd /d "%~dp0"
echo.
echo ===============================================================
echo   CLONAGEM DE VOZ MASTER - servidor no seu computador (v1.5.23)
echo ===============================================================
echo.

set "PY=python"
py -3.12 --version >nul 2>nul && set "PY=py -3.12"
py -3.10 --version >nul 2>nul && set "PY=py -3.10"
py -3.11 --version >nul 2>nul && set "PY=py -3.11"
%PY% --version >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Python nao encontrado.
  echo Instale o Python 3.11 em https://www.python.org/downloads/
  echo e marque a opcao "Add python.exe to PATH" na instalacao.
  pause & exit /b 1
)
%PY% -c "import sys;sys.exit(0 if (3,10)<=sys.version_info[:2]<(3,13) else 1)"
if errorlevel 1 (
  echo [ERRO] Seu Python e muito novo ou muito antigo para o modelo de voz.
  echo Instale o Python 3.11 em https://www.python.org/downloads/release/python-3119/
  echo e marque "Add python.exe to PATH". Depois rode este arquivo de novo.
  pause & exit /b 1
)
where git >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Git nao encontrado. Instale em https://git-scm.com/download/win
  pause & exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo Criando ambiente do Python ^(so na primeira vez^)...
  %PY% -m venv .venv || (echo [ERRO] Nao consegui criar o ambiente. & pause & exit /b 1)
)
set "VPY=%cd%\.venv\Scripts\python.exe"

if not exist "chatterbox-ptbr\app.py" (
  echo Baixando o Chatterbox pt-BR ^(so na primeira vez^)...
  git clone --depth 1 https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS-pt-br chatterbox-ptbr || (echo [ERRO] Falha ao baixar. & pause & exit /b 1)
)

if not exist ".venv\instalado.ok" (
  echo Instalando as bibliotecas ^(pode demorar bastante na primeira vez^)...
  "%VPY%" -m pip install --upgrade pip
  "%VPY%" -m pip install -r chatterbox-ptbr\requirements.txt || (echo [ERRO] Falha ao instalar. & pause & exit /b 1)
  where nvidia-smi >nul 2>nul
  if errorlevel 1 (
    echo [AVISO] Sem placa NVIDIA: vai funcionar, mas a geracao fica lenta.
  ) else (
    call :instalar_gpu
  )
  echo ok> ".venv\instalado.ok"
)

echo Atualizando o script do servidor...
curl -fsSL -o iniciar_servidor.py https://raw.githubusercontent.com/jhoncorretor2025-blip/delta-prompts/main/canivete/voz/iniciar_servidor.py
if not exist iniciar_servidor.py (echo [ERRO] Nao consegui baixar o iniciar_servidor.py & pause & exit /b 1)

"%VPY%" iniciar_servidor.py --motor pc --pasta chatterbox-ptbr
pause
exit /b 0

:instalar_gpu
echo Placa NVIDIA encontrada: instalando versao com GPU...
for /f "usebackq delims=" %%v in (`"%VPY%" -c "import torch;print(torch.__version__.split('+')[0])"`) do set "TV=%%v"
for %%c in (cu124 cu126 cu128) do (
  "%VPY%" -m pip install --force-reinstall --no-deps torch==%TV% torchaudio==%TV% --index-url https://download.pytorch.org/whl/%%c && goto :gpu_ok
)
echo [AVISO] Nao consegui instalar a versao com GPU. Vai funcionar, mas mais lento.
:gpu_ok
exit /b 0
