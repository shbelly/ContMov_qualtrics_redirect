from pathlib import Path
import json
from aiohttp import web

PROJECT_ROOT = Path(__file__).parent


async def serve_static(request):
    """Handle GET requests to serve static content."""
    filename = request.match_info.get('filename')
    file_path = PROJECT_ROOT / filename
    if not file_path.exists():
        return web.Response(status=404, text=f"File '{filename}' not found")
    return web.FileResponse(file_path)


async def handle_post(request):
    """Handle POST requests and save data to a CSV file."""
    try:
        data = await request.json()
        with open(Path(".") / "data" / data["filename"], "a") as fid:
            fid.write(data["filedata"])

        return web.json_response({"status": "success", "message": "Row saved successfully"})
    except json.JSONDecodeError:
        return web.Response(status=400, text="Invalid JSON format")
    except Exception as e:
        return web.Response(status=500, text=f"Internal Server Error: {e}")


app = web.Application()
app.router.add_get("/{filename:.*}", serve_static)
app.router.add_post("/save_data_append", handle_post)


if __name__ == '__main__':
    web.run_app(app, port=8000)
