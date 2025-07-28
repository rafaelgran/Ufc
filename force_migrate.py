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

def clear_all_data():
    """Limpa todos os dados existentes no Supabase"""
    print("🧹 Limpando todos os dados existentes no Supabase...")
    
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
    
    # Limpar fighters
    try:
        response = requests.delete(f"{SUPABASE_URL}/fighters", headers=headers)
        print(f"🗑️ Fighters removidos: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Erro ao limpar fighters: {e}")

def insert_fighters(local_data):
    """Insere fighters no Supabase"""
    print("👥 Inserindo fighters...")
    
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
                print(f"❌ Erro ao inserir fighter {fighter['name']}: {response.status_code}")
        except Exception as e:
            print(f"❌ Erro ao inserir fighter {fighter['name']}: {e}")

def insert_events_and_fights(local_data):
    """Insere events e fights no Supabase"""
    print("🎯 Inserindo events e fights...")
    
    for event in local_data:
        # Inserir event
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
            response = requests.post(
                f"{SUPABASE_URL}/events",
                headers=headers,
                json=event_data
            )
            if response.status_code == 201:
                print(f"✅ Event inserido: {event['name']}")
            else:
                print(f"❌ Erro ao inserir event {event['name']}: {response.status_code}")
        except Exception as e:
            print(f"❌ Erro ao inserir event {event['name']}: {e}")
            continue
        
        # Inserir fights do event
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
                    response = requests.post(
                        f"{SUPABASE_URL}/fights",
                        headers=headers,
                        json=fight_data
                    )
                    if response.status_code == 201:
                        print(f"  ✅ Fight inserido: {fight['fighter1']['name']} vs {fight['fighter2']['name']}")
                    else:
                        print(f"  ❌ Erro ao inserir fight: {response.status_code}")
                except Exception as e:
                    print(f"  ❌ Erro ao inserir fight: {e}")

def main():
    print("🚀 Iniciando migração forçada para Supabase...")
    
    # Buscar dados locais
    local_data = get_local_data()
    if not local_data:
        print("❌ Não foi possível obter dados locais")
        return
    
    print(f"📊 Encontrados {len(local_data)} events para migrar")
    
    # Limpar todos os dados existentes
    clear_all_data()
    
    # Inserir fighters primeiro
    insert_fighters(local_data)
    
    # Inserir events e fights
    insert_events_and_fights(local_data)
    
    print("✅ Migração forçada concluída!")
    
    # Verificar resultado
    try:
        response = requests.get(f"{SUPABASE_URL}/events?select=*", headers=headers)
        if response.status_code == 200:
            events = response.json()
            print(f"📈 Total de events no Supabase: {len(events)}")
            for event in events:
                print(f"  - {event['name']} (ID: {event['id']})")
    except Exception as e:
        print(f"❌ Erro ao verificar resultado: {e}")

if __name__ == "__main__":
    main() 