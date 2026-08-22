import subprocess
import sys
import webbrowser
import time
import os

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def launch():
    print("==================================================")
    print(" Harmony Expense Tracker - Application Launcher")
    print(" Cultivate Financial Wellness and Growth")
    print("==================================================")

    base_dir = os.path.dirname(os.path.abspath(__file__))

    print("\n[1/2] Initializing FastAPI Backend Server...")
    server_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.server:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=base_dir
    )
    print("      Backend API active at: http://127.0.0.1:8000")

    print("\n[2/2] Initializing React Vite Frontend...")
    frontend_dir = os.path.join(base_dir, "frontend")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        shell=True
    )

    time.sleep(2)
    webbrowser.open("http://localhost:5173")

    print("\nHarmony Expense Tracker is now running successfully.")
    print("Access the web interface at: http://localhost:5173")
    print("Press Ctrl+C to terminate both services.\n")

    try:
        server_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nTerminating Harmony Expense Tracker services...")
        server_process.terminate()
        frontend_process.terminate()
        print("Shutdown complete.")

if __name__ == "__main__":
    launch()
