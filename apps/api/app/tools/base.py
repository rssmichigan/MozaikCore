from pydantic import BaseModel

class ToolSpec(BaseModel):
    name: str
    description: str
    input_schema: dict
    output_schema: dict

class Tool:
    spec: ToolSpec
    def run(self, **kwargs) -> dict: ...
