"""Claude vision menu extraction.

Claude EXTRACTS structured dishes with macro RANGES via a forced tool. It never
ranks and never sees the user's targets — scoring.py does that. `parse_tool_input`
is pure (no network) so extraction parsing is unit-testable against a fixture.
"""

from pathlib import Path
from typing import Any

from app.config import get_settings
from app.models.scan import ExtractedDish, ScanRequest
from app.services.claude_client import get_client

_SYSTEM_PROMPT = (Path(__file__).resolve().parent.parent / "prompts" / "extract_menu.txt").read_text(
    encoding="utf-8"
)

_RANGE_SCHEMA = {
    "type": "object",
    "properties": {"low": {"type": "integer"}, "high": {"type": "integer"}},
    "required": ["low", "high"],
}

RECORD_MENU_TOOL: dict[str, Any] = {
    "name": "record_menu",
    "description": "Record the structured list of orderable dishes read off the menu.",
    "input_schema": {
        "type": "object",
        "properties": {
            "dishes": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "description": {"type": "string"},
                        "ingredients": {"type": "array", "items": {"type": "string"}},
                        "calories": _RANGE_SCHEMA,
                        "protein_g": _RANGE_SCHEMA,
                        "fibre_g": _RANGE_SCHEMA,
                        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
                        "cook_method_flags": {"type": "array", "items": {"type": "string"}},
                        "candidate_modifications": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": [
                        "name", "ingredients", "calories", "protein_g", "fibre_g",
                        "confidence", "cook_method_flags", "candidate_modifications",
                    ],
                },
            }
        },
        "required": ["dishes"],
    },
}


def _build_messages(req: ScanRequest) -> list[dict[str, Any]]:
    content: list[dict[str, Any]] = []
    if req.image_base64:
        content.append({
            "type": "image",
            "source": {"type": "base64", "media_type": "image/jpeg", "data": req.image_base64},
        })

    instruction = "Extract every orderable dish from this menu using the record_menu tool."
    if req.restaurant_name:
        instruction += f" The restaurant is: {req.restaurant_name}."
    if req.source == "text" and req.menu_text:
        instruction += f"\n\nMenu:\n{req.menu_text}"
    content.append({"type": "text", "text": instruction})

    return [{"role": "user", "content": content}]


def parse_tool_input(data: dict[str, Any]) -> list[ExtractedDish]:
    """Pure: turn the record_menu tool input into ExtractedDish models."""
    return [ExtractedDish.model_validate(d) for d in data.get("dishes", [])]


def _parse_response(response: Any) -> list[ExtractedDish]:
    for block in response.content:
        if getattr(block, "type", None) == "tool_use" and block.name == "record_menu":
            return parse_tool_input(block.input)
    return []


def extract_menu(req: ScanRequest) -> list[ExtractedDish]:
    client = get_client()
    settings = get_settings()
    response = client.messages.create(
        model=settings.claude_model,
        max_tokens=4000,
        system=_SYSTEM_PROMPT,
        tools=[RECORD_MENU_TOOL],
        tool_choice={"type": "tool", "name": "record_menu"},
        messages=_build_messages(req),
    )
    return _parse_response(response)
