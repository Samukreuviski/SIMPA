"""
servidor_frontend.py — Predicta
Servidor HTTP simples para servir o frontend_dashboard durante o desenvolvimento.
Não requer psycopg2 nem banco de dados.

Uso: python servidor_frontend.py
Acesse: http://localhost:8000/painel
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))

class PredictaHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # /painel e / → index.html
        if self.path in ('/', '/painel', '/painel/'):
            self.path = '/frontend_dashboard/index.html'
        # /assets/... → frontend_dashboard/...
        elif self.path.startswith('/assets/'):
            self.path = '/frontend_dashboard/' + self.path[len('/assets/'):]
        return super().do_GET()

    def log_message(self, format, *args):
        print(f"  {self.address_string()} - {format % args}")

if __name__ == '__main__':
    os.chdir(ROOT)
    server = HTTPServer(('localhost', PORT), PredictaHandler)
    print("=" * 50)
    print(f"  Predicta - Servidor Frontend")
    print(f"  URL: http://localhost:{PORT}/painel")
    print(f"  Pasta: {ROOT}")
    print("  Ctrl+C para encerrar")
    print("=" * 50)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Servidor encerrado.")
