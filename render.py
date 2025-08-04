# render_project.py
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import time

# ---- Config ----
PROJECT_FILE = "example.json"
EXPORT_FORMAT = "png"  # 'png' or 'pdf' or 'html'
EXPORT_DPI = 600
EXPORT_DIR = Path("exports")
EXPORT_DIR.mkdir(exist_ok=True)

SITE_URL = "https://plan.mehow.site/"
EXPORT_PATH = EXPORT_DIR / f"rendered_output.{EXPORT_FORMAT}"


# ---- Main Logic ----
async def render_and_capture_export():
    start_time = time.time()
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)  # Set to False for debugging
        context = await browser.new_context(accept_downloads=True)
        page = await context.new_page()

        print("🔄 Loading site...")
        await page.goto(SITE_URL)
        await page.wait_for_load_state("networkidle")

        print("📁 Uploading project file...")
        file_input = await page.wait_for_selector('input[type="file"]#loadFile')
        await file_input.set_input_files(PROJECT_FILE)
        await page.evaluate(f"loadProject()")

        print("⏳ Waiting for widgets to render...")
        await page.wait_for_selector(".widget", timeout=7000)
        print("📦 Triggering export via exportCanvas()...")
        async with page.expect_download() as download_info:
            await page.evaluate(f"exportCanvas('{EXPORT_FORMAT}', {EXPORT_DPI});")

        download = await download_info.value
        await download.save_as(EXPORT_PATH)

        print(f"✅ Exported file saved to: {EXPORT_PATH.resolve()}")
        await browser.close()
        # time.sleep(120)
        end_time = time.time()
        print(f"⏱️ Total time taken: {end_time - start_time:.2f} seconds")


# ---- Entry ----
if __name__ == "__main__":
    asyncio.run(render_and_capture_export())
