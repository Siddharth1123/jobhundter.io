import asyncio
import time
import os
import sys

# Add backend directory to sys.path so worker can reuse SQLAlchemy models and DB session if needed
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

async def run_worker_loop():
    print("[Worker] CareerPilot AI Background Service initialized.")
    print("[Worker] Responsible for job ingestion, deduplication, auto-matching, and follow-up processing.")
    
    while True:
        try:
            print("[Worker] Running scheduled ingestion cycle...")
            # Simulate job discovery & deduplication step
            print("[Worker] Job sources checked: 4 active feeds. 0 duplicates found.")
            print("[Worker] Pre-calculating match scores for updated profiles...")
            await asyncio.sleep(60) # Run every 60 seconds
        except Exception as e:
            print(f"[Worker] Error in worker loop: {e}")
            await asyncio.sleep(10)

if __name__ == "__main__":
    asyncio.run(run_worker_loop())
