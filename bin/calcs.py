from collections import namedtuple

Rect = namedtuple("Rect", ["width", "height"])
window = Rect(800, 600)


def calc_reset_pos():
    reset = Rect(90, 60)
    coord = (window.width / 2) - (reset.width / 2)
    # (355, 530)
    print((coord, 530))


calc_reset_pos()
