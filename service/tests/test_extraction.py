"""Unit tests for the pure tool-output parser (no network)."""

import json
from pathlib import Path

from app.services.extraction import parse_tool_input

FIXTURE = json.loads(
    (Path(__file__).parent / "fixtures" / "claude_extract_response.json").read_text(encoding="utf-8")
)


def test_parse_reads_every_dish():
    dishes = parse_tool_input(FIXTURE)
    assert len(dishes) == 4
    assert "Chicken shawarma bowl" in [d.name for d in dishes]


def test_parse_preserves_ranges_and_confidence():
    chef = next(d for d in parse_tool_input(FIXTURE) if d.name == "Daily chef special")
    assert chef.confidence == "low"
    assert chef.calories.low == 400
    assert chef.calories.high == 1200


def test_parse_empty_is_empty():
    assert parse_tool_input({"dishes": []}) == []
    assert parse_tool_input({}) == []
