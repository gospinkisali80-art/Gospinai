from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

API_KEY = os.getenv("OPENROUTER_API_KEY")

app = Flask(__name__, static_folder=".")
CORS(app)

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/style.css")
def style():
    return send_from_directory(".", "style.css")

@app.route("/script.js")
def script():
    return send_from_directory(".", "script.js")


@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_message = request.json.get("message", "")

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "My AI"
        }

        data = {
            "model": "openrouter/free",
            "messages": [
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        }

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=60
        )

        print("Status:", response.status_code)
        print(response.text)

        if response.status_code != 200:
            return jsonify({
                "reply": f"OpenRouter Error:\n{response.text}"
            })

        result = response.json()

        reply = result["choices"][0]["message"]["content"]

        return jsonify({
            "reply": reply
        })

    except Exception as e:
        return jsonify({
            "reply": f"Python Error: {str(e)}"
        })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)