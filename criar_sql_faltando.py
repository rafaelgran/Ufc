#!/usr/bin/env python3
"""
Script para criar SQL apenas com os países que estão faltando SVG
"""

# Lista dos países que estão faltando (do JSON fornecido)
paises_faltando = [
    "vg", "kh", "ky", "td", "km", "hr", "tl", "sv", "gq", "gf", "pf", "gm", "ge", 
    "gh", "gi", "gr", "gl", "gd", "gp", "gu", "gt", "gn", "gw", "gy", "ht", "hn", 
    "hk", "hu", "is", "in", "id", "ir", "iq", "ie", "il", "it", "jm", "jp", "jo", 
    "kz", "ke", "ki", "xk", "kw", "kg", "la", "lv", "lb", "lr", "ly", "lt", "mo", 
    "mg", "my", "mv", "ml", "mt", "mh", "mq", "mr", "mu", "yt", "mx", "md", "mn", 
    "me", "ms", "ma", "mm", "nr", "np", "nl", "nc", "nz", "ni", "ne", "ng", "nu", 
    "kp", "mk", "mp", "no", "om", "pk", "pw", "pa", "pg", "py", "pe", "ph", "pn", 
    "pl", "pt", "pr", "qa", "re", "ro", "ru", "kn", "lc", "mf", "vc", "st", "sa", 
    "sn", "rs", "sc", "sl", "sg", "sx", "sk", "si", "sb", "so", "za", "gs", "kr", 
    "ss", "lk", "sd", "sr", "se", "sy", "tw", "tj", "tz", "th", "tg", "tk", "tt", 
    "tn", "tr", "tm", "tc", "tv", "vi", "ug", "ua", "us", "uy", "uz", "vu", "ve", 
    "vn", "wf", "ye"
]

# Ler o arquivo original
with open('update_svgs.sql', 'r') as f:
    content = f.read()

# Dividir em linhas
lines = content.split('\n')

# Filtrar apenas as linhas dos países que estão faltando
sql_lines = []
for line in lines:
    for flag_code in paises_faltando:
        if f"flag_code = '{flag_code}'" in line:
            sql_lines.append(line)
            break

# Criar o arquivo SQL
with open('svgs_faltando_final.sql', 'w') as f:
    f.write("-- Script para atualizar SVGs dos países que estão faltando\n")
    f.write("-- Execute este script no SQL Editor do Supabase\n\n")
    f.write('\n'.join(sql_lines))

print(f"✅ Criado arquivo 'svgs_faltando_final.sql' com {len(sql_lines)} países")
print(f"📊 Total de países que estavam faltando: {len(paises_faltando)}")
print(f"🎯 Países encontrados no arquivo original: {len(sql_lines)}") 