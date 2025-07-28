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

def clear_supabase_data():
    """Limpa dados existentes no Supabase"""
    print("🧹 Limpando dados existentes no Supabase...")
    
    # Limpar fights primeiro (devido à foreign key)
    try:
        response = requests.delete(f"{SUPABASE_URL}/fights", headers=headers)
        print(f"🗑️ Fights removidos: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Erro ao limpar fights: {e}")
    
    # Limpar events
    try:
        response = requests.delete(f"{SUPABASE_URL}/events", headers=headers)
        print(f"🗑️ Events removidos: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Erro ao limpar events: {e}")

def migrate_fighters(local_data):
    """Migra fighters para o Supabase"""
    print("👥 Migrando fighters...")
    
    fighters = set()
    for event in local_data:
        if 'fights' in event and event['fights']:
            for fight in event['fights']:
                if 'fighter1' in fight:
                    fighters.add(json.dumps(fight['fighter1'], sort_keys=True))
                if 'fighter2' in fight:
                    fighters.add(json.dumps(fight['fighter2'], sort_keys=True))
    
    for fighter_json in fighters:
        fighter = json.loads(fighter_json)
        try:
            # Tentar inserir primeiro
            response = requests.post(
                f"{SUPABASE_URL}/fighters",
                headers=headers,
                json={
                    "id": fighter['id'],
                    "name": fighter['name'],
                    "nickname": fighter.get('nickname'),
                    "record": fighter.get('record'),
                    "photo": fighter.get('photo'),
                    "ranking": fighter.get('ranking')
                }
            )
            if response.status_code == 201:
                print(f"✅ Fighter inserido: {fighter['name']}")
            else:
                # Se falhar, tentar atualizar
                response = requests.patch(
                    f"{SUPABASE_URL}/fighters?id=eq.{fighter['id']}",
                    headers=headers,
                    json={
                        "name": fighter['name'],
                        "nickname": fighter.get('nickname'),
                        "record": fighter.get('record'),
                        "photo": fighter.get('photo'),
                        "ranking": fighter.get('ranking')
                    }
                )
                if response.status_code == 200:
                    print(f"✅ Fighter atualizado: {fighter['name']}")
                else:
                    print(f"⚠️ Fighter não pôde ser atualizado: {fighter['name']}")
        except Exception as e:
            print(f"❌ Erro ao migrar fighter {fighter['name']}: {e}")

def migrate_events_and_fights(local_data):
    """Migra events e fights para o Supabase"""
    print("🎯 Migrando events e fights...")
    
    for event in local_data:
        # Migrar event
        event_data = {
            "id": event['id'],
            "name": event['name'],
            "date": event['date'],
            "location": event.get('location'),
            "venue": event.get('venue'),
            "mainevent": event.get('mainEvent'),
            "status": event.get('status', 'upcoming')
        }
        
        try:
            # Tentar inserir primeiro
            response = requests.post(
                f"{SUPABASE_URL}/events",
                headers=headers,
                json=event_data
            )
            if response.status_code == 201:
                print(f"✅ Event inserido: {event['name']}")
            else:
                # Se falhar, tentar atualizar
                response = requests.patch(
                    f"{SUPABASE_URL}/events?id=eq.{event['id']}",
                    headers=headers,
                    json={
                        "name": event['name'],
                        "date": event['date'],
                        "location": event.get('location'),
                        "venue": event.get('venue'),
                        "mainevent": event.get('mainEvent'),
                        "status": event.get('status', 'upcoming')
                    }
                )
                if response.status_code == 200:
                    print(f"✅ Event atualizado: {event['name']}")
                else:
                    print(f"⚠️ Event não pôde ser atualizado: {event['name']}")
        except Exception as e:
            print(f"❌ Erro ao migrar event {event['name']}: {e}")
            continue
        
        # Migrar fights do event
        if 'fights' in event and event['fights']:
            for fight in event['fights']:
                fight_data = {
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
                }
                
                try:
                    # Tentar inserir primeiro
                    response = requests.post(
                        f"{SUPABASE_URL}/fights",
                        headers=headers,
                        json=fight_data
                    )
                    if response.status_code == 201:
                        print(f"  ✅ Fight inserido: {fight['fighter1']['name']} vs {fight['fighter2']['name']}")
                    else:
                        # Se falhar, tentar atualizar
                        response = requests.patch(
                            f"{SUPABASE_URL}/fights?id=eq.{fight['id']}",
                            headers=headers,
                            json={
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
                            }
                        )
                        if response.status_code == 200:
                            print(f"  ✅ Fight atualizado: {fight['fighter1']['name']} vs {fight['fighter2']['name']}")
                        else:
                            print(f"  ⚠️ Fight não pôde ser atualizado: {fight['fighter1']['name']} vs {fight['fighter2']['name']}")
                except Exception as e:
                    print(f"  ❌ Erro ao migrar fight: {e}")

def main():
    print("🚀 Iniciando migração para Supabase...")
    
    # Buscar dados locais
    local_data = get_local_data()
    if not local_data:
        print("❌ Não foi possível obter dados locais")
        return
    
    print(f"📊 Encontrados {len(local_data)} events para migrar")
    
    # Limpar dados existentes
    clear_supabase_data()
    
    # Migrar fighters primeiro
    migrate_fighters(local_data)
    
    # Migrar events e fights
    migrate_events_and_fights(local_data)
    
    print("✅ Migração concluída!")
    
    # Verificar resultado
    try:
        response = requests.get(f"{SUPABASE_URL}/events?select=*", headers=headers)
        if response.status_code == 200:
            events = response.json()
            print(f"📈 Total de events no Supabase: {len(events)}")
            for event in events:
                print(f"  - {event['name']}")
    except Exception as e:
        print(f"❌ Erro ao verificar resultado: {e}")

if __name__ == "__main__":
    main() 