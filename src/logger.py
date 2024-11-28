import logging
import os
from pathlib import Path

def setup_logger(name="app", log_level=logging.INFO, log_dir=None):
    """
    Configures a logger with file and console handlers.
    """
    # Determine log directory
    log_dir = Path(log_dir or os.getenv("LOG_DIR", Path(__file__).parent / "log"))
    log_dir.mkdir(exist_ok=True)  # Create directory if not exists
    log_file = log_dir / f"{name}.log"

    # Configure logger
    logger = logging.getLogger(name)
    logger.setLevel(log_level)

    # File handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    logger.addHandler(file_handler)

    # Console handler (fallback for environments like Render)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    logger.addHandler(console_handler)

    logger.info(f"Logger initialized for {name}. Logs saved at {log_file}")
    return logger
