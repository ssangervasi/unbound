import string

import fontforge


def main():
    print("~~ main ~~")
    filename = "Basty-tiny.sfd"
    font = fontforge.open(filename)

    for letter in string.ascii_uppercase:
        print(f"~~ letter: {letter}")
        glyph = font.createMappedChar(letter)
        glyph.importOutlines(f"letters/BastyFont ({letter}).svg")

    font.save(filename)


print("~~ if __name__ ~~")
if __name__ == "__main__":
    main()
