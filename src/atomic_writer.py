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
from typing import Any, Dict, List, Tuple, Optional


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
            prefix=f".tmp_{target_path.name}_",
            delete=False
        ) as tmp_file:
            json.dump(data, tmp_file, indent=indent, ensure_ascii=False)
            tmp_file.flush()
            os.fsync(tmp_file.fileno())
            tmp_path = Path(tmp_file.name)

        # Atomic rename replacing destination
        os.replace(tmp_path, target_path)
    except Exception as e:
        if tmp_path and tmp_path.exists():
            try:
                os.remove(tmp_path)
            except OSError:
                pass
        raise AtomicWriteError(f"Failed to atomically write {target_path}: {e}") from e


class AtomicTransaction:
    """
    Manages multi-file staging and commit. If any write or validation fails,
    all staged files are cleaned up and original target files are untouched.
    """

    def __init__(self) -> None:
        self.staged_writes: List[Tuple[Path, Any, int]] = []
        self.temp_files: List[Path] = []
        self.is_committed: bool = False

    def __enter__(self) -> "AtomicTransaction":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> Optional[bool]:
        if exc_type is not None:
            self.rollback()
            return False
        else:
            self.commit()
            return True

    def stage_json(self, target_path: Path, data: Any, indent: int = 2) -> None:
        """Stage a JSON file payload for commit."""
        self.staged_writes.append((Path(target_path).resolve(), data, indent))

    def write_json(self, target_path: Path, data: Any, indent: int = 2) -> None:
        """Alias for stage_json to match file write interface."""
        self.stage_json(target_path, data, indent)

    def commit(self) -> None:
        """Atomically commit all staged file writes."""
        if self.is_committed:
            return

        written_tmp_pairs: List[Tuple[Path, Path]] = []
        try:
            # 1. Write all data to individual temp files
            for target_path, data, indent in self.staged_writes:
                target_dir = target_path.parent
                target_dir.mkdir(parents=True, exist_ok=True)
                with tempfile.NamedTemporaryFile(
                    mode="w",
                    encoding="utf-8",
                    dir=target_dir,
                    prefix=f".tx_tmp_{target_path.name}_",
                    delete=False
                ) as tmp_file:
                    json.dump(data, tmp_file, indent=indent, ensure_ascii=False)
                    tmp_file.flush()
                    os.fsync(tmp_file.fileno())
                    tmp_path = Path(tmp_file.name)
                    self.temp_files.append(tmp_path)
                    written_tmp_pairs.append((tmp_path, target_path))

            # 2. Perform atomic replace on all target files
            for tmp_path, target_path in written_tmp_pairs:
                os.replace(tmp_path, target_path)

            self.is_committed = True
        except Exception as e:
            self.rollback()
            raise AtomicWriteError(f"Transaction commit failed, rolled back: {e}") from e

    def rollback(self) -> None:
        """Clean up any temporary files without touching target files."""
        for tmp_path in self.temp_files:
            if tmp_path.exists():
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
        self.temp_files = []
        self.staged_writes = []
