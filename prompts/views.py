from django.shortcuts import render
from django.http import JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
import json
import os
from datetime import datetime
import requests
import os
from dotenv import load_dotenv
from openai import OpenAI
from django.conf import settings

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def get_translation(text, target_language='en'):
    try:
        # Using LibreTranslate public API
        url = "https://translate.argosopentech.com/translate"
        data = {
            "q": text,
            "source": "it",
            "target": target_language,
            "format": "text"
        }
        
        response = requests.post(url, json=data)
        if response.status_code == 200:
            result = response.json()
            return result['translatedText']
        else:
            print(f"Translation error: {response.text}")
            return None
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return None

def index(request):
    return render(request, 'base.html')

@csrf_exempt
def translate(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            text = data.get('text', '')
            
            if not text:
                return JsonResponse({
                    'success': False,
                    'error': 'Nessun testo da tradurre'
                })
            
            translated_text = get_translation(text)
            
            if translated_text:
                return JsonResponse({
                    'success': True,
                    'translation': translated_text
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Errore durante la traduzione. Riprova tra qualche secondo.'
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Errore: {str(e)}'
            })

@csrf_exempt
def submit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            json_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'json_storage')
            os.makedirs(json_dir, exist_ok=True)
            
            # Extract data from the new format
            classe = data.get('classe', '')
            user_code = data.get('user_code', '')
            gruppo = data.get('gruppo', '')
            prompts = data.get('prompts', {})
            
            # Create the final data structure
            final_data = {
                'user_data': {
                    'classe': classe,
                    'user_code': user_code,
                    'gruppo': gruppo
                },
                'prompts': prompts,
                'timestamp': datetime.now().strftime('%Y%m%d_%H%M%S')
            }
            
            # Generate filename using user_code
            filename = f"{user_code}.json"
            filepath = os.path.join(json_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(final_data, f, ensure_ascii=False, indent=2)
            
            return JsonResponse({'success': True, 'filename': filename})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

def get_prompts(request, user_code):
    """Recupera il file JSON dei prompt per il codice utente specificato."""
    json_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'json_storage')
    filepath = os.path.join(json_dir, f"{user_code}.json")
    
    if not os.path.exists(filepath):
        raise Http404("Prompts non trovati")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def translate_prompts(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            prompts = data.get('prompts', {})
            
            translated_prompts = {}
            
            for section, section_prompts in prompts.items():
                translated_prompts[section] = []
                for prompt in section_prompts:
                    if prompt.strip():  # Traduci solo se il prompt non è vuoto
                        response = client.chat.completions.create(
                            model="gpt-3.5-turbo",
                            messages=[
                                {"role": "system", "content": "You are a translator. Translate the following Italian text into English, maintaining the same descriptive style and details. The translation should be suitable for image generation prompts."},
                                {"role": "user", "content": prompt}
                            ]
                        )
                        translated_prompt = response.choices[0].message.content
                        translated_prompts[section].append(translated_prompt)
                    else:
                        translated_prompts[section].append("")
            
            return JsonResponse({
                'success': True,
                'translated_prompts': translated_prompts
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})
