# -*- coding: utf-8 -*-
"""
Clonagem de Voz Master — servidor próprio (v1.5.12)
Liga o Chatterbox pt-BR no seu computador ou no Google Colab e cria um link
público temporário (.gradio.live) que a página do Canivete usa para gerar a voz.

Uso:
  python iniciar_servidor.py --motor pc      (no seu computador)
  python iniciar_servidor.py --motor colab   (no Google Colab)
"""
import argparse
import os
import re
import subprocess
import sys
import time
import types
import urllib.parse
import webbrowser

PAGINA = "https://jhoncorretor2025-blip.github.io/delta-prompts/canivete/clonagem-de-voz-master.html"
REPO_MODELO = "https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS-pt-br"


def aviso(texto):
    print("\n" + "=" * 70 + "\n" + texto + "\n" + "=" * 70 + "\n", flush=True)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    parser = argparse.ArgumentParser()
    parser.add_argument("--motor", choices=["pc", "colab"], default="pc")
    parser.add_argument("--pasta", default="chatterbox-ptbr")
    args = parser.parse_args()

    pasta = os.path.abspath(args.pasta)
    if not os.path.exists(os.path.join(pasta, "app.py")):
        aviso("📥 Baixando o Chatterbox pt-BR (só na primeira vez)...")
        subprocess.check_call(["git", "clone", "--depth", "1", REPO_MODELO, pasta])

    os.chdir(pasta)
    sys.path.insert(0, pasta)

    # O pacote "spaces" só existe no Hugging Face. Fora de lá, criamos um substituto
    # que não faz nada, para o app funcionar igual.
    try:
        import spaces  # noqa: F401
    except Exception:
        stub = types.ModuleType("spaces")

        def GPU(func=None, **_kwargs):
            if callable(func):
                return func
            return lambda f: f

        stub.GPU = GPU
        sys.modules["spaces"] = stub

    with open("app.py", encoding="utf-8") as arquivo:
        codigo = arquivo.read()
    # Removemos o "launch" original para ligar do nosso jeito (com link público).
    codigo, trocas = re.subn(r"^demo\.launch\(.*\)\s*$", "", codigo, flags=re.M)
    if not trocas:
        print("⚠️ Não encontrei a linha demo.launch(...) no app.py. Vou tentar mesmo assim.")

    aviso("🧠 Carregando o modelo de voz...\nNa primeira vez ele baixa alguns arquivos grandes. Pode demorar vários minutos.")
    contexto = {"__name__": "chatterbox_app", "__file__": os.path.join(pasta, "app.py")}
    exec(compile(codigo, os.path.join(pasta, "app.py"), "exec"), contexto)
    demo = contexto["demo"]

    _app, _local, link_publico = demo.launch(share=True, prevent_thread_lock=True, show_error=True)
    if not link_publico:
        aviso("❌ Não consegui criar o link público (.gradio.live).\n"
              "Isso costuma ser antivírus ou firewall bloqueando o 'frpc' do Gradio.\n"
              "Libere o programa no antivírus e rode de novo.")
        return

    link_publico = link_publico.rstrip("/")
    endereco = (PAGINA + "?motor=" + args.motor + "&servidor="
                + urllib.parse.quote(link_publico, safe="") + "#gerar-voz")
    aviso("✅ SERVIDOR DE VOZ LIGADO!\n\n"
          "👉 Abra este link para usar (já vem conectado):\n" + endereco + "\n\n"
          "Ou cole este endereço na página, em 'Onde a voz vai ser gerada?':\n" + link_publico + "\n\n"
          "⚠️ Deixe esta janela aberta enquanto estiver usando.\n"
          "O link muda toda vez que você ligar o servidor.")
    if args.motor == "pc":
        try:
            webbrowser.open(endereco)
        except Exception:
            pass

    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        print("Servidor desligado. Até mais! 👋")


if __name__ == "__main__":
    main()
