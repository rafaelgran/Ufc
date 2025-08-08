#!/usr/bin/env python3
"""
Script para verificar países sem SVG no Supabase
Execute: python check_missing_svgs.py
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erro: Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env")
    sys.exit(1)

# Criar cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_missing_svgs():
    """Verificar países sem SVG no banco"""
    try:
        print("🔍 Verificando países sem SVG no Supabase...")
        print("=" * 50)
        
        # 1. Estatísticas gerais
        print("\n📊 ESTATÍSTICAS GERAIS:")
        result = supabase.table('countries').select('*').execute()
        countries = result.data
        
        total = len(countries)
        with_svg = len([c for c in countries if c.get('flag_svg')])
        without_svg = total - with_svg
        
        print(f"Total de países: {total}")
        print(f"Com SVG: {with_svg}")
        print(f"Sem SVG: {without_svg}")
        print(f"Percentual com SVG: {(with_svg/total)*100:.1f}%")
        
        # 2. Listar países sem SVG
        print(f"\n❌ PAÍSES SEM SVG ({without_svg} países):")
        print("-" * 50)
        
        missing_countries = []
        for country in countries:
            if not country.get('flag_svg'):
                missing_countries.append(country)
                print(f"• {country.get('name', 'N/A')} ({country.get('flag_code', 'N/A')})")
        
        # 3. Listar alguns países com SVG (exemplo)
        print(f"\n✅ EXEMPLOS DE PAÍSES COM SVG:")
        print("-" * 50)
        
        with_svg_countries = [c for c in countries if c.get('flag_svg')][:5]
        for country in with_svg_countries:
            svg_length = len(country.get('flag_svg', ''))
            print(f"• {country.get('name', 'N/A')} ({country.get('flag_code', 'N/A')}) - SVG: {svg_length} chars")
        
        # 4. Resumo
        print(f"\n📋 RESUMO:")
        print("-" * 50)
        if without_svg == 0:
            print("🎉 TODOS OS PAÍSES TÊM SVG!")
        else:
            print(f"⚠️  Faltam {without_svg} países sem SVG")
            print(f"💡 Execute os arquivos part_1.sql, part_2.sql e part_3.sql para completar")
        
        return missing_countries
        
    except Exception as e:
        print(f"❌ Erro ao verificar países: {e}")
        return []

if __name__ == "__main__":
    missing = check_missing_svgs() 