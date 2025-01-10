""" 
CHANGELOG:

2025.01.10
- Fixed tag parsing (would return first part split by tag_sep)
"""
from typing import Any
import parse # type: ignore

# Type	Characters Matched	                                                                Output
# l	    Letters (ASCII)	                                                                    str
# w	    Letters, numbers and underscore	                                                    str
# W	    Not letters, numbers and underscore	                                                str
# s	    Whitespace	                                                                        str
# S	    Non-whitespace	                                                                    str
# d	    Digits (effectively integer numbers)	                                            int
# D	    Non-digit	                                                                        str
# n	    Numbers with thousands separators (, or .)	                                        int
# %	    Percentage (converted to value/100.0)	                                            float
# f	    Fixed-point numbers	                                                                float
# F	    Decimal numbers	                                                                    Decimal
# e	    Floating-point numbers with exponent e.g. 1.1e-10, NAN (all case insensitive)	    float
# g	    General number format (either d, f or e)	                                        float
# b	    Binary numbers	                                                                    int
# o	    Octal numbers	                                                                    int
# x	    Hexadecimal numbers (lower and upper case)	                                        int


class StringParser:

    def __init__(self, formats: list[str], use_tags: bool=True):
        self.formats = self.expand_formats(formats)
        self.use_tags = use_tags
        self.tags_sep = ' #'
    
    def parse(self, string: str) -> dict[str, Any] | None:
        for f in self.formats:
            string_cpy = string
            if self.use_tags:
                string_cpy, tags = self.extract_tags(string_cpy)
            parsed_data: Any = parse.parse(f, string_cpy) # type: ignore
            if parsed_data != None:
                data = parsed_data.named
                if self.use_tags:
                    data['tags'] = tags # type: ignore
                return data
        return None
    
    def format(self, data: dict[str, Any]) -> str | None:
        data = self.prune_data(data)
        tags, data = self.separate_tags(data)
        for f in self.formats:
            f = self.remove_unsupported_format_codes(f)
            try:
                str = f.format(**data)
                if self.use_tags:
                    for tag in tags:
                        str += self.tags_sep + tag
                return str
            except KeyError:
                pass
        return None
    
    def extract_tags(self, string: str):
        tags: list[str] = []
        parts = string.split(self.tags_sep)
        while parts != []:
            if ' ' not in parts[-1]:
                tags.append(parts.pop())
            else:
                break
        return self.tags_sep.join(parts), tags
    
    @staticmethod
    def separate_tags(data: dict[str, Any]):
        tags = []
        if 'tags' in data:
            tags = [ t.replace(' ', '-') for t in data['tags'] ]
            del data['tags']
        return tags, data
    
    @staticmethod
    def remove_unsupported_format_codes(f: str) -> str:
        for code in [':S', ':D']:
            f = f.replace(code, '')
        return f
    
    def expand_formats(self, formats: list[str] | str) -> list[str]:
        opt_sig = ';opt'
        if isinstance(formats, str):
            formats = [formats]
        new_formats: list[str] = []
        for fmt_base in formats:
            format_parts = fmt_base.split()
            optional_count = len([c for c in format_parts if c.endswith(opt_sig)])
            for n in range(2**optional_count):
                parts: list[str] = []
                i = 0
                for part in format_parts:
                    if not part.endswith(opt_sig):
                        parts.append(part) # type:
                    else:
                        mask = 2 ** i
                        if n & mask:
                            parts.append(part.replace(opt_sig, ''))
                        i += 1
                fmt = ' '.join(parts)
                new_formats.append(fmt)
        new_formats.sort(
            reverse=True, 
            key=lambda fmt: ( len(self.get_parse_in_fmt(fmt)), len(self.get_non_param_chars(fmt)) )
        )
        return new_formats
    
    @staticmethod
    def get_parse_in_fmt(fmt: str) -> list[str]:
        return fmt.split('}')
    
    @staticmethod
    def get_non_param_chars(fmt: str) -> str:
        parts = fmt.split('{')
        parts = [ p.split('}')[-1] for p in parts ]
        string = ''.join(parts).replace(' ', '')
        return string
    
    @staticmethod
    def is_date(str: str) -> bool:
        for c in '.-_':
            str = str.replace(c, '')
        return str.isnumeric()
    
    @staticmethod
    def prune_data(data: dict[Any, Any]):
        remove_keys = [ k for k, v in data.items() if v == None ]
        for k in remove_keys:
            del data[k]
        return data

    @staticmethod
    def to_cc(string: str) -> str:
        if ' ' not in string:
            return string
        parts = [ p for p in string.lower().split(" ") if p != '' ]
        for i in range(len(parts)):
            part = parts[i]
            parts[i] = part[:1].upper() + part[1:]
        return ''.join(parts)
    
    @staticmethod
    def from_cc(string: str) -> str:
        chars: list[str] = []
        for c in list(string):
            if c.isupper():
                chars.append(' ')
            chars.append(c)
        return ''.join(chars)



if __name__ == '__main__':

    formats = [
        "{sort_performer} - {studio:ns} - [{year:d;opt}] [{date_released:dt;opt}] [{line:ns;opt}] {scene_title} ({mention_performer:opt}) [{other_info:opt}]",
        "[{studio:ns}] [{year:d;opt}] [{date_released:dt;opt}] [{line:ns;opt}] {scene_title} ({sort_performer:opt}) [{other_info:opt}]",
        "{sort_performer} [{year:d;opt}] [{date_released:dt;opt}] {scene_title} [{other_info:opt}]",
        "[{jav_code:ns}]",
        "{sort_performer} - {scene_title}",
        "{scene_title}",
    ]

    parser = StringParser(formats)

