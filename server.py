"""
MP43 Downloader - Ultra-Fast Real-Time Media Server
Powered by yt-dlp native Python API & static-ffmpeg
With Live Progress Tracking & Multi-threading
"""

import http.server
import socketserver
import json
import os
import sys
import tempfile
import urllib.parse
import re
import uuid
import threading
import time

PORT = 5000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Setup FFmpeg
FFMPEG_EXE = None
try:
    import static_ffmpeg.run
    FFMPEG_EXE, _ = static_ffmpeg.run.get_or_fetch_platform_executables_else_raise()
    print(f"[FFmpeg] Ready at: {FFMPEG_EXE}")
except Exception as e:
    print(f"[FFmpeg Warning] {e}")

# In-memory Task State Tracker
TASKS = {}
TEMP_FILES = {}

def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "", name).strip()

def run_download_worker(task_id, url, fmt, quality):
    import yt_dlp

    task = TASKS[task_id]
    task['status'] = 'downloading'
    task['percent'] = 5
    task['message'] = 'Menghubungi server YouTube via yt-dlp...'

    tmpdir = tempfile.mkdtemp(prefix='mp43_')
    out_template = os.path.join(tmpdir, "%(title)s.%(ext)s")

    def progress_hook(d):
        if d['status'] == 'downloading':
            downloaded = d.get('downloaded_bytes', 0)
            total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
            speed = d.get('speed') or 0
            eta = d.get('eta')

            if total > 0:
                percent = int((downloaded / total) * 90)
                dl_mb = f"{downloaded / (1024*1024):.1f} MB"
                tot_mb = f"{total / (1024*1024):.1f} MB"
                speed_str = f" - {speed / (1024*1024):.1f} MB/s" if speed else ""
                eta_str = f" (sisa {eta}s)" if eta else ""
                
                task['percent'] = max(5, min(92, percent))
                task['message'] = f"Mengunduh: {dl_mb} / {tot_mb} ({percent}%){speed_str}{eta_str}"
            else:
                dl_mb = f"{downloaded / (1024*1024):.1f} MB"
                task['percent'] = 45
                task['message'] = f"Mengunduh stream: {dl_mb}..."

        elif d['status'] == 'finished':
            task['status'] = 'processing'
            task['percent'] = 95
            task['message'] = 'Menggabungkan trek audio & video via FFmpeg...'

    ydl_opts = {
        'outtmpl': out_template,
        'progress_hooks': [progress_hook],
        'source_address': '0.0.0.0', # Force IPv4 to eliminate IPv6 timeout latency
        'concurrent_fragment_downloads': 4,
        'no_warnings': True,
        'quiet': True,
        'no_playlist': True,
        'nocheckcertificate': True
    }

    if FFMPEG_EXE and os.path.exists(FFMPEG_EXE):
        ydl_opts['ffmpeg_location'] = FFMPEG_EXE

    if fmt == 'mp3':
        bitrate_map = {
            '320k': '0',
            '256k': '1',
            '192k': '3',
            '128k': '5'
        }
        q_val = bitrate_map.get(quality, '0')
        ydl_opts['format'] = 'bestaudio/best'
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': q_val,
        }]
    else:
        # MP4 Video
        height_match = re.search(r'(\d+)', quality)
        max_h = height_match.group(1) if height_match else "720"
        
        ydl_opts['format'] = (
            f"bestvideo[height<={max_h}][ext=mp4]+bestaudio[ext=m4a]/"
            f"bestvideo[height<={max_h}]+bestaudio/"
            f"best[height<={max_h}][ext=mp4]/"
            f"best[height<={max_h}]/best"
        )
        ydl_opts['merge_output_format'] = 'mp4'

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        files = [f for f in os.listdir(tmpdir) if not f.endswith('.part')]
        if not files:
            raise Exception("Tidak ada berkas media yang selesai diproses.")

        target_file = files[0]
        final_path = os.path.join(tmpdir, target_file)

        TEMP_FILES[task_id] = {
            'path': final_path,
            'filename': target_file,
            'tmpdir': tmpdir,
            'mime': 'audio/mpeg' if fmt == 'mp3' else 'video/mp4'
        }

        task['status'] = 'ready'
        task['percent'] = 100
        task['message'] = 'Konversi & Unduhan Selesai 100%!'
        task['filename'] = target_file
        print(f"[Success] Task {task_id} completed: {target_file}")

    except Exception as e:
        task['status'] = 'error'
        task['error'] = str(e)
        task['message'] = f"Gagal mengunduh: {e}"
        print(f"[Error] Task {task_id} failed: {e}")

class DownloaderHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def send_json(self, data, status=200):
        payload = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Connection', 'close')
        self.end_headers()
        self.wfile.write(payload)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path == '/api/health':
            self.send_json({"status": "ok"})
            return

        elif path == '/api/progress':
            task_id = query.get('taskId', [None])[0]
            task = TASKS.get(task_id, {"status": "not_found", "message": "Task tidak ditemukan"})
            self.send_json(task)
            return

        elif path == '/api/file':
            task_id = query.get('taskId', [None])[0]
            info = TEMP_FILES.get(task_id)

            if not info or not os.path.exists(info['path']):
                self.send_response(404)
                self.end_headers()
                return

            file_path = info['path']
            filename = info['filename']
            file_size = os.path.getsize(file_path)

            self.send_response(200)
            self.send_header('Content-Type', info['mime'])
            safe_name = urllib.parse.quote(filename)
            self.send_header('Content-Disposition', f'attachment; filename="{safe_name}"; filename*=UTF-8\'\'{safe_name}')
            self.send_header('Content-Length', str(file_size))
            self.end_headers()

            with open(file_path, 'rb') as f:
                try:
                    while chunk := f.read(64 * 1024):
                        self.wfile.write(chunk)
                except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
                    pass
            return

        super().do_GET()

    def do_POST(self):
        if self.path == '/api/start-download':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                body = json.loads(post_data.decode('utf-8'))
                url = body.get('url')
                fmt = body.get('format', 'mp4').lower()
                quality = body.get('quality', '720p')

                if not url:
                    raise Exception("URL YouTube tidak boleh kosong.")

                task_id = str(uuid.uuid4())
                TASKS[task_id] = {
                    'status': 'initializing',
                    'percent': 2,
                    'message': 'Memulai proses pengunduhan...'
                }

                thread = threading.Thread(target=run_download_worker, args=(task_id, url, fmt, quality), daemon=True)
                thread.start()

                self.send_json({"taskId": task_id})

            except Exception as e:
                self.send_json({"error": str(e)}, status=400)
        else:
            self.send_response(404)
            self.end_headers()

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

if __name__ == '__main__':
    print(f"==================================================")
    print(f"  MP43 Downloader - Real-Time Server Aktif")
    print(f"  Alamat Web:  http://localhost:{PORT}")
    print(f"  Live API:    http://localhost:{PORT}/api/start-download")
    print(f"==================================================")
    
    with ThreadingTCPServer(("", PORT), DownloaderHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")
            sys.exit(0)
