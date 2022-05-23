import sys
sys.path.append('./backend')
import webview
from backend.myapp import app
from flask import render_template



@app.route('/', methods=['GET'])
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    webview.create_window('PwdManager', app)
    webview.start(debug=True, gui='edgechromium')