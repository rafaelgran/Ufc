#!/usr/bin/env python3
import requests
import json

# Configurações do Supabase
SUPABASE_URL = "https://igxztpjrojdmyzzhqxsv.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU"

headers = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "apikey": SUPABASE_KEY,
    "Content-Type": "application/json"
}

def test_fighters():
    """Testa a busca de fighters"""
    url = f"{SUPABASE_URL}/rest/v1/fighters?select=*&order=name.asc"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        fighters = response.json()
        print(f"✅ Fighters encontrados: {len(fighters)}")
        
        # Mostrar alguns fighters com seus países
        for i, fighter in enumerate(fighters[:5]):
            print(f"  {i+1}. {fighter.get('name', 'N/A')} - País: {fighter.get('country', 'N/A')}")
        
        return fighters
    else:
        print(f"❌ Erro ao buscar fighters: {response.status_code}")
        print(f"Resposta: {response.text}")
        return []

def test_countries():
    """Testa a busca de countries"""
    url = f"{SUPABASE_URL}/rest/v1/countries?select=*&order=name.asc"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        countries = response.json()
        print(f"✅ Countries encontrados: {len(countries)}")
        
        # Mostrar alguns countries com seus SVGs
        for i, country in enumerate(countries[:5]):
            flag_svg = country.get('flag_svg', 'N/A')
            svg_length = len(flag_svg) if flag_svg != 'N/A' else 0
            print(f"  {i+1}. {country.get('name', 'N/A')} - SVG length: {svg_length}")
        
        return countries
    else:
        print(f"❌ Erro ao buscar countries: {response.status_code}")
        print(f"Resposta: {response.text}")
        return []

def test_manual_join():
    """Testa o JOIN manual"""
    fighters = test_fighters()
    countries = test_countries()
    
    if not fighters or not countries:
        return
    
    # Criar dicionário de countries
    countries_dict = {country['name']: country for country in countries}
    
    print(f"\n🔍 Testando JOIN manual...")
    
    # Testar alguns fighters
    for i, fighter in enumerate(fighters[:10]):
        country_name = fighter.get('country')
        if country_name:
            country_data = countries_dict.get(country_name)
            if country_data:
                flag_svg = country_data.get('flag_svg')
                svg_length = len(flag_svg) if flag_svg else 0
                print(f"  ✅ {fighter['name']} ({country_name}) - SVG: {svg_length} chars")
            else:
                print(f"  ❌ {fighter['name']} ({country_name}) - País não encontrado")
        else:
            print(f"  ⚠️  {fighter['name']} - Sem país")

if __name__ == "__main__":
    print("🧪 Testando dados das bandeiras...\n")
    test_manual_join() 