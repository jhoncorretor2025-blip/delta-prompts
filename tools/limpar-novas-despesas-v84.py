from pathlib import Path
p=Path('canivete.html')
s=p.read_text(encoding='utf-8')
marker='<!-- CANIVETE-V84-LIMPA-DESPESAS-VAZIAS -->'
if marker not in s:
    patch='''\n<script id="canivete-v84-limpa-despesas-vazias">\n(function(){\n  function limpar(){\n    try{\n      var chaves=['canivete_despesas','despesas','delta_despesas','caniveteDespesas'];\n      chaves.forEach(function(k){\n        var raw=localStorage.getItem(k);\n        if(!raw) return;\n        try{\n          var v=JSON.parse(raw);\n          if(Array.isArray(v)){\n            var lim=v.filter(function(x){\n              var n=String((x&& (x.nome||x.name||x.descricao||x.title))||'').trim().toLowerCase();\n              return n && n!=='nova despesa';\n            });\n            if(lim.length!==v.length) localStorage.setItem(k,JSON.stringify(lim));\n          }\n        }catch(e){}\n      });\n    }catch(e){}\n  }\n  limpar();\n  document.addEventListener('DOMContentLoaded',limpar);\n  setTimeout(limpar,500);\n})();\n</script>\n<!-- CANIVETE-V84-LIMPA-DESPESAS-VAZIAS -->\n'''
    s=s.replace('</body>',patch+'</body>')
p.write_text(s,encoding='utf-8')
