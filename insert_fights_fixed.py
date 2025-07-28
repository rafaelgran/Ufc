#!/usr/bin/env python3
import requests
import json
from datetime import datetime

# Configurações
LOCAL_API_URL = "http://localhost:3000/api/export"
SUPABASE_URL = "https://igxztpjrojdmyzzhqxsv.supabase.co/rest/v1"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHp0cGpyb2pkbXl6emhxeHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE5MjUsImV4cCI6MjA2ODg3NzkyNX0.VhfZ5BCOrGa6SK51eiwQ96pyfwV9bOcu6bHLFJSGaQU"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def get_local_data():
    """Busca dados do servidor local"""
    try:
        response = requests.get(LOCAL_API_URL)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Erro ao buscar dados locais: {e}")
        return None

def insert_fights(local_data):
    """Insere fights no Supabase"""
    print("🥊 Inserindo fights...")
    
    for event in local_data:
        if 'fights' in event and event['fights']:
            for fight in event['fights']:
                # Tentar diferentes nomes de coluna
                fight_data_attempts = [
                    {
                        "id": fight['id'],
                        "event_id": event['id'],
                        "fighter1_id": fight['fighter1']['id'],
                        "fighter2_id": fight['fighter2']['id'],
                        "weight_class": fight.get('weightClass'),
                        "fight_type": "Regular",
                        "rounds": fight.get('rounds', 3),
                        "time_remaining": fight.get('timeRemaining', 300),
                        "status": fight.get('status', 'scheduled'),
                        "winner_id": fight.get('winnerId'),
                        "fight_order": 1
                    },
                    {
                        "id": fight['id'],
                        "eventid": event['id'],
                        "fighter1_id": fight['fighter1']['id'],
                        "fighter2_id": fight['fighter2']['id'],
                        "weight_class": fight.get('weightClass'),
                        "fight_type": "Regular",
                        "rounds": fight.get('rounds', 3),
                        "time_remaining": fight.get('timeRemaining', 300),
                        "status": fight.get('status', 'scheduled'),
                        "winner_id": fight.get('winnerId'),
                        "fight_order": 1
                    },
                    {
                        "id": fight['id'],
                        "eventid": event['id'],
                        "fighter1id": fight['fighter1']['id'],
                        "fighter2id": fight['fighter2']['id'],
                        "weightclass": fight.get('weightClass'),
                        "fighttype": "Regular",
                        "rounds": fight.get('rounds', 3),
                        "timeremaining": fight.get('timeRemaining', 300),
                        "status": fight.get('status', 'scheduled'),
                        "winnerid": fight.get('winnerId'),
                        "fightorder": 1
                    }
                ]
                
                success = False
                for i, fight_data in enumerate(fight_data_attempts):
                    try:
                        response = requests.post(
                            f"{SUPABASE_URL}/fights",
                            headers=headers,
                            json=fight_data
                        )
                        if response.status_code == 201:
                            print(f"✅ Fight inserido (tentativa {i+1}): {fight['fighter1']['name']} vs {fight['fighter2']['name']}")
                            success = True
                            break
                        else:
                            print(f"⚠️ Tentativa {i+1} falhou: {response.status_code} - {response.text}")
                    except Exception as e:
                        print(f"❌ Erro na tentativa {i+1}: {e}")
                
                if not success:
                    print(f"❌ Todas as tentativas falharam para: {fight['fighter1']['name']} vs {fight['fighter2']['name']}")

def main():
    print("🚀 Inserindo fights com estrutura corrigida...")
    
    # Buscar dados locais
    local_data = get_local_data()
    if not local_data:
        print("❌ Não foi possível obter dados locais")
        return
    
    print(f"📊 Encontrados {len(local_data)} events para processar")
    
    # Inserir fights
    insert_fights(local_data)
    
    print("✅ Inserção concluída!")
    
    # Verificar resultado
    try:
        response = requests.get(f"{SUPABASE_URL}/fights?select=*", headers=headers)
        if response.status_code == 200:
            fights = response.json()
            print(f"📈 Total de fights no Supabase: {len(fights)}")
            for fight in fights:
                print(f"  - Fight ID: {fight['id']}")
    except Exception as e:
        print(f"❌ Erro ao verificar resultado: {e}")

if __name__ == "__main__":
    main() 