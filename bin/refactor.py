import json
from collections import namedtuple

Rect = namedtuple("Rect", ["width", "height"])
Coord = namedtuple("Coord", ["x", "y"])
WINDOW_RECT = Rect(800, 600)
WINDOW_CENTER = Coord(WINDOW_RECT.width / 2, WINDOW_RECT.height / 2)


OPERATIONS = []


def reg_op(f):
    # from functools import wraps
    # @wraps(f)
    # def wrapper(project):
    #     return f(project)
    OPERATIONS.append(f)
    return f


@reg_op
def remove_bind_indicators(project):
    for layout in project["layouts"]:
        original_instances = layout["instances"]
        new_instances = [
            instance
            for instance in original_instances
            if instance["name"] != "BindIndicator"
        ]
        layout["instances"] = new_instances


@reg_op
def remove_non_global_counters(project):
    for layout in project["layouts"]:
        original_objs = layout["objects"]
        new_objs = [
            obj
            for obj in original_objs
            if obj["name"] not in ("Unbound_Val", "Unbound_Desc")
        ]
        layout["objects"] = new_objs


@reg_op
def add_pause_reminders_to_levels(project):
    for layout in project["layouts"]:
        if not layout["name"].startswith("L_"):
            continue

        instances = layout["instances"]
        if any((instance["name"] == "PauseReminder" for instance in instances)):
            continue

        instances.append(
            {
                "angle": 0,
                "customSize": True,
                "height": 32,
                "layer": "UI",
                "locked": False,
                "name": "PauseReminder",
                "width": 24,
                "x": 34,
                "y": 19,
                "zOrder": 218,
                "numberProperties": [],
                "stringProperties": [],
                "initialVariables": [],
            }
        )


@reg_op
def position_reminders(project):
    for layout in project["layouts"]:
        for instance in layout["instances"]:
            if instance["name"] == "ResetReminder":
                print("ResetReminder", layout["name"])
                rect = Rect(74, 50)
                coord = Coord(
                    WINDOW_CENTER.x - (rect.width / 2),
                    WINDOW_RECT.height - 20 - rect.height,
                )
                instance["width"] = rect.width
                instance["height"] = rect.height
                instance["x"] = coord.x
                instance["y"] = coord.y
            elif instance["name"] == "PauseReminder":
                print("PauseReminder", layout["name"])
                rect = Rect(37, 50)
                coord = Coord(20, 20)
                instance["width"] = rect.width
                instance["height"] = rect.height
                instance["x"] = coord.x
                instance["y"] = coord.y
                print("PauseReminder", instance)


@reg_op
def position_counters(project):
    for layout in project["layouts"]:
        for instance in layout["instances"]:
            if instance["name"] == "Unbound_Desc":
                instance["x"] = 575
                instance["y"] = 20
                instance["layer"] = "UI"
            elif instance["name"] == "Unbound_Val":
                instance["x"] = 745
                instance["y"] = 20
                instance["layer"] = "UI"


def main(args):
    # path_in = './unbound.json'
    path_in = './unbound.refactor.json'
    path_out = './unbound.refactor.json'
    operation = [op for op in OPERATIONS if op.__name__ == args.operation][0]

    project = None
    with open(path_in) as project_file:
        project = json.load(project_file)

    operation(project)

    with open(path_out, "w") as project_file:
        json.dump(
            project,
            project_file,
            # sort_keys=True,
            indent=2,
        )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "operation", choices=[op.__name__ for op in OPERATIONS],
    )

    main(parser.parse_args())
