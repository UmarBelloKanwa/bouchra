from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import Union
import os
import google.generativeai as genai
import httpx
import urllib.parse

GOOGLE_AI_API_KEY = os.getenv('GOOGLE_AI_API_KEY')
ASSEMBLY_AI_API_KEY = os.getenv('ASSEMBLY_AI_API_KEY')
TRANSLATION_AI_API_KEY = os.getenv('TRANSLATION_AI_API_KEY')
MY_EMAIL = os.getenv('MY_EMAIL')

app = FastAPI()
genai.configure(api_key= GOOGLE_AI_API_KEY)
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

app.mount('/static', StaticFiles(directory='static'), name='static')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory='templates')

@app.get('/', response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse('index.html', {'request': request})

@app.post('/chat')
async def conversation(
    value: Union[str, UploadFile] = File(...),
    type: str = Form(...),
    lang: str = Form(...)
):
    if type == 'voice':
        audio_bytes = await value.read()
        text = await speech_to_text(audio_bytes)
    else:
        text = value

    response = model.generate_content(
        contents=[
            {
                "parts": [
                    {"text": text}
                ]
            }
        ]
    )

    response_text = response.text

    if lang ==  'العربية':
        response_text = await translate(response_text, 'EN', 'AR')
    elif lang ==  'Français':
        response_text = await translate(response_text, 'EN', 'FR')

    return {'message': response_text}

async def speech_to_text(audio_bytes: bytes) -> str:
    import assemblyai as aai

    aai.settings.api_key =  ASSEMBLY_AI_API_KEY

    FILE_URL = audio_bytes

    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(FILE_URL)

    if transcript.status == aai.TranscriptStatus.error:
        return transcript.error
    else:
        return transcript.text


async def translate(text: str, from_lang: str, to_lang: str) -> str:
    max_length = 500
    translated_text = []

    for i in range(0, len(text), max_length):
        chunk = text[i:i + max_length]
        query = urllib.parse.quote(chunk)
        key = TRANSLATION_AI_API_KEY
        de = MY_EMAIL
        url = f'https://api.mymemory.translated.net/get?q={query}&key={key}&de={de}&langpair={from_lang}|{to_lang}'

        async with httpx.AsyncClient() as client:
            response = await client.post(url)
            data = response.json()
            translated_text.append(data['responseData']['translatedText'])

    return ''.join(translated_text)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
