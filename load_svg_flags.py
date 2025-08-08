#!/usr/bin/env python3
"""
Script para carregar automaticamente os SVGs das bandeiras no Supabase
Execute: python load_svg_flags.py
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

# Inicializar cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def load_svg_content(file_path):
    """Carrega o conteúdo de um arquivo SVG"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except FileNotFoundError:
        print(f"⚠️  Arquivo não encontrado: {file_path}")
        return None
    except Exception as e:
        print(f"❌ Erro ao ler arquivo {file_path}: {e}")
        return None

def update_flag_svg(flag_code, svg_content):
    """Atualiza o SVG de uma bandeira no Supabase"""
    try:
        result = supabase.table('countries').update({
            'flag_svg': svg_content
        }).eq('flag_code', flag_code).execute()
        
        if result.data:
            print(f"✅ Atualizado: {flag_code}")
            return True
        else:
            print(f"⚠️  País não encontrado: {flag_code}")
            return False
    except Exception as e:
        print(f"❌ Erro ao atualizar {flag_code}: {e}")
        return False

def main():
    """Função principal"""
    print("🚀 Iniciando carregamento de SVGs das bandeiras...")
    
    # Caminho para a pasta de bandeiras
    flags_dir = "Fyte/Assets.xcassets/flags"
    
    if not os.path.exists(flags_dir):
        print(f"❌ Pasta de bandeiras não encontrada: {flags_dir}")
        sys.exit(1)
    
    # Contadores
    total_files = 0
    success_count = 0
    error_count = 0
    
    # Processar cada arquivo SVG
    for filename in os.listdir(flags_dir):
        if filename.endswith('.svg'):
            total_files += 1
            flag_code = filename.replace('.svg', '')
            
            # Caminho completo do arquivo
            file_path = os.path.join(flags_dir, filename)
            
            # Carregar conteúdo SVG
            svg_content = load_svg_content(file_path)
            
            if svg_content:
                # Atualizar no Supabase
                if update_flag_svg(flag_code, svg_content):
                    success_count += 1
                else:
                    error_count += 1
            else:
                error_count += 1
    
    # Relatório final
    print("\n" + "="*50)
    print("📊 RELATÓRIO FINAL")
    print("="*50)
    print(f"📁 Total de arquivos SVG: {total_files}")
    print(f"✅ Sucessos: {success_count}")
    print(f"❌ Erros: {error_count}")
    print(f"📈 Taxa de sucesso: {(success_count/total_files)*100:.1f}%")
    
    if success_count > 0:
        print("\n🎉 Carregamento concluído com sucesso!")
    else:
        print("\n⚠️  Nenhum arquivo foi carregado. Verifique os erros acima.")

def check_database_connection():
    """Verifica a conexão com o banco de dados"""
    try:
        result = supabase.table('countries').select('count').execute()
        print("✅ Conexão com Supabase estabelecida")
        return True
    except Exception as e:
        print(f"❌ Erro na conexão com Supabase: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Verificando conexão com o banco...")
    
    if check_database_connection():
        main()
    else:
        print("❌ Não foi possível conectar ao banco de dados")
        sys.exit(1) 