# render_project.py
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

PROJECT_FILE = "example.json"  # Your project file
EXPORT_FORMAT = "png"  # or "jpg", if supported
EXPORT_DPI = "300"
EXPORT_DIR = Path("exports")
EXPORT_DIR.mkdir(exist_ok=True)

SITE_URL = "https://plan.mehow.site/"
EXPORT_PATH = EXPORT_DIR / f"rendered_output.{EXPORT_FORMAT}"


async def render_and_capture_export():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False
        )  # Set to False to debug visually
        context = await browser.new_context(accept_downloads=True)
        page = await context.new_page()

        await page.goto(SITE_URL)
        await page.wait_for_load_state("networkidle")

        # Upload the project file
        file_input = await page.wait_for_selector('input[type="file"]#loadFile')
        await file_input.set_input_files(PROJECT_FILE)

        # Optional: click "Load" button if required
        load_button = await page.query_selector("#loadProjectBtn")
        if load_button:
            await load_button.click()

        # Wait for widgets to render
        await page.wait_for_selector(".widget", timeout=7000)

        # Set export options (if dropdowns exist)
        await page.select_option("#exportFormat", EXPORT_FORMAT)
        await page.select_option("#exportDPI", EXPORT_DPI)

        # Click the export button and capture the download
        async with page.expect_download() as download_info:
            await page.click("#exportButton")

        download = await download_info.value
        await download.save_as(EXPORT_PATH)

        print(f"✅ Exported file saved to: {EXPORT_PATH.resolve()}")
        await browser.close()


if __name__ == "__main__":
    asyncio.run(render_and_capture_export())
