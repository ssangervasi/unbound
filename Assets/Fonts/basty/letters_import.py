import string

import fontforge


def main():
    print("Opening font")
    filename = "Basty-tiny.sfd"
    font = fontforge.open(filename)

    # import_letters(font)
    import_numbers(font)
    import_symbols(font)

    font.save(filename)


def import_letters(font):
    for c in string.ascii_uppercase:
        print(f"Importing letter: {c}")
        import_glyph(font, c)


def import_numbers(font):
    for n in map(str, range(0, 9)):
        print(f"Importing number: {n}")
        import_glyph(font, n)


def import_symbols(font):
    # Lol why did I use my own names instead of the standard ones
    sym_to_alias = {
        "!": "exclamation",
        '"': "quote_double",
        "'": "quote_single",
        "#": "number",
        "$": "dollar",
        "%": "percent",
        "&": "ampersand",
        "(": "paren_open",
        ")": "paren_close",
        "*": "star",
        "+": "plus",
        ",": "comma",
        "-": "dash",
        ".": "dot",
        "/": "slash",
        ":": "colon",
        ";": "slash",
        "<": "less_than",
        "=": "equal",
        ">": "greater_than",
        "?": "question",
        "@": "at",
        "[": "bracket_open",
        "]": "bracket_close",
        "\\": "backslash",
        "^": "caret",
        "_": "underscore",
        "`": "backtick",
        "{": "brace_open",
        "}": "brace_close",
        "|": "bar",
        "~": "tilde",
    }
    for s, alias in sym_to_alias.items():
        print(f"Importing symbol: {s} as {alias}")
        import_glyph(font, s, file_alias=alias)


def import_glyph(font, glyph, file_alias=None):
    if file_alias is None:
        file_alias = glyph

    glyph = font.createMappedChar(glyph)
    glyph.importOutlines(f"letters/BastyFont ({glyph}).svg")


if __name__ == "__main__":
    main()
