#!/usr/bin/env bash
# Clonagem de Voz Master — servidor no seu computador (Mac/Linux) v1.5.20
set -e
cd "$(dirname "$0")"
echo "=== CLONAGEM DE VOZ MASTER — servidor no seu computador (v1.5.20) ==="
PY=$(command -v python3.11 || command -v python3.10 || command -v python3.12 || command -v python3 || true)
[ -z "$PY" ] && { echo "❌ Instale o Python 3.11 (python.org)"; exit 1; }
"$PY" -c "import sys;sys.exit(0 if (3,10)<=sys.version_info[:2]<(3,13) else 1)" || { echo "❌ Seu Python é novo/antigo demais para o modelo. Instale o Python 3.11."; exit 1; }
command -v git >/dev/null || { echo "❌ Instale o Git"; exit 1; }
[ -x .venv/bin/python ] || "$PY" -m venv .venv
VPY="$(pwd)/.venv/bin/python"
[ -f chatterbox-ptbr/app.py ] || git clone --depth 1 https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS-pt-br chatterbox-ptbr
if [ ! -f .venv/instalado.ok ]; then
  echo "📦 Instalando bibliotecas (demora na primeira vez)..."
  "$VPY" -m pip install --upgrade pip
  "$VPY" -m pip install -r chatterbox-ptbr/requirements.txt
  touch .venv/instalado.ok
fi
curl -fsSL -o iniciar_servidor.py https://raw.githubusercontent.com/jhoncorretor2025-blip/delta-prompts/main/canivete/voz/iniciar_servidor.py
"$VPY" iniciar_servidor.py --motor pc --pasta chatterbox-ptbr
