# render_project.py
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import time

# ---- Config ----
PROJECT_FILE = "example.json"
EXPORT_FORMAT = "png"  # 'png' or 'pdf' or 'html'
EXPORT_DPI = 300
EXPORT_DIR = Path("exports")
EXPORT_DIR.mkdir(exist_ok=True)

SITE_URL = "https://plan.mehow.site/"
EXPORT_PATH = EXPORT_DIR / f"rendered_output.{EXPORT_FORMAT}"


# ---- Main Logic ----
async def render_and_capture_export():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # Set to False for debugging
        context = await browser.new_context(accept_downloads=True)
        page = await context.new_page()

        print("🔄 Loading site...")
        await page.goto(SITE_URL)
        await page.wait_for_load_state("networkidle")

        print("📁 Uploading project file...")
        file_input = await page.wait_for_selector('input[type="file"]#loadFile')
        await file_input.set_input_files(PROJECT_FILE)

        # Optional: click load button if needed
        load_button = await page.query_selector("#loadProjectBtn")
        if load_button:
            await load_button.click()

        print("⏳ Waiting for widgets to render...")
        await asyncio.sleep(2)  # Adjust as needed for your project
        await page.wait_for_selector(".widget", timeout=7000)
        await asyncio.sleep(2)
        print("📦 Triggering export via exportCanvas()...")
        async with page.expect_download() as download_info:
            await page.evaluate(f"exportCanvas('{EXPORT_FORMAT}', {EXPORT_DPI});")

        download = await download_info.value
        await download.save_as(EXPORT_PATH)

        print(f"✅ Exported file saved to: {EXPORT_PATH.resolve()}")
        # await browser.close()
        time.sleep(120)


# ---- Entry ----
if __name__ == "__main__":
    asyncio.run(render_and_capture_export())
