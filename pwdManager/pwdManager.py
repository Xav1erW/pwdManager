import sys
sys.path.append('./backend')
import webview
from backend.myapp import app
# import backend.Auth
# import backend.File
# import backend.Lib



@app.route('/', methods=['GET'])
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    webview.create_window('PwdManager', app, width=950, height=600)
    webview.start(debug=False, gui='edgechromium')