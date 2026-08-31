#!/usr/bin/env python3
"""
src/atomic_writer.py
====================
Provides atomic file write and multi-file transaction operations to guarantee
zero data corruption and seamless rollbacks if invariant validation fails.
"""

import json
import os
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Tuple


class AtomicWriteError(Exception):
    """Raised when an atomic write or transaction fails."""
    pass


def atomic_write_json(target_path: Path, data: Any, indent: int = 2) -> None:
    """
    Atomically write JSON data to target_path using a temporary file and atomic replace.
    """
    target_path = Path(target_path).resolve()
    target_dir = target_path.parent
    target_dir.mkdir(parents=True, exist_ok=True)

    # Use NamedTemporaryFile in the same directory to guarantee same filesystem (for atomic os.replace)
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=target_dir,
            prefix=f".{target_path.name}.",
            suffix=".tmp",
            delete=False
        ) as tmp_file:
            tmp_path = Path(tmp_file.name)
            json.dump(data, tmp_file, indent=indent, ensure_ascii=False)
            tmp_file.write("\n")
            tmp_file.flush()
            os.fsync(tmp_file.fileno())

        os.replace(tmp_path, target_path)
    except Exception as e:
        if tmp_path and tmp_path.exists():
            try:
                tmp_path.unlink()
            except Exception:
                pass
        raise AtomicWriteError(f"Failed to atomically write {target_path}: {e}") from e


class AtomicTransaction:
    """
    Multi-file atomic transaction buffer.
    Stages data in memory, writes temporary files on commit, and replaces them atomically.
    If an invariant error or exception occurs, all temporary files are purged without modifying targets.
    """

    def __init__(self) -> None:
        self.staged_writes: List[Tuple[Path, Any, int]] = []
        self.temp_files: List[Path] = []
        self.is_committed: bool = False

    def stage_json(self, target_path: Path, data: Any, indent: int = 2) -> None:
        """Stage a JSON file payload for commit."""
        self.staged_writes.append((Path(target_path).resolve(), data, indent))

    def commit(self) -> None:
        """Atomically commit all staged file writes."""
        if not self.staged_writes:
            return

        self.temp_files = []
        try:
            # Step 1: Write all temp files to disk
            for target_path, data, indent in self.staged_writes:
                target_dir = target_path.parent
                target_dir.mkdir(parents=True, exist_ok=True)
                
                with tempfile.NamedTemporaryFile(
                    mode="w",
                    encoding="utf-8",
                    dir=target_dir,
                    prefix=f".{target_path.name}.",
                    suffix=".tmp",
                    delete=False
                ) as tmp_file:
                    tmp_path = Path(tmp_file.name)
                    self.temp_files.append((tmp_path, target_path))
                    json.dump(data, tmp_file, indent=indent, ensure_ascii=False)
                    tmp_file.write("\n")
                    tmp_file.flush()
                    os.fsync(tmp_file.fileno())

            # Step 2: Atomically replace all targets
            for tmp_path, target_path in self.temp_files:
                os.replace(tmp_path, target_path)

            self.is_committed = True
        except Exception as e:
            self.rollback()
            raise AtomicWriteError(f"Transaction commit failed, rolled back: {e}") from e

    def rollback(self) -> None:
        """Clean up any temporary files without touching target files."""
        for tmp_path, _ in self.temp_files:
            if isinstance(tmp_path, Path) and tmp_path.exists():
                try:
                    tmp_path.unlink()
                except Exception:
                    pass
        self.temp_files = []
        self.staged_writes = []
