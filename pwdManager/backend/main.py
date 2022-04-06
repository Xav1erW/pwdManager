import webview

if __name__ == '__main__':
    # develop
    webview.create_window("Pwd Manager", "http://localhost:3000", width=900, height=600)
    # webview.create_window("Pwd Manager", "../gui/index.html", width=900, height=600, frameless=True)
    webview.start(debug=True, gui='edgechromium')