#!/usr/bin/env python3

import json
from collections import namedtuple

Rect = namedtuple("Rect", ["width", "height"])
Coord = namedtuple("Coord", ["x", "y"])
WINDOW_RECT = Rect(800, 600)
WINDOW_CENTER = Coord(WINDOW_RECT.width / 2, WINDOW_RECT.height / 2)


NAME_TO_OPERATION = {}


def reg_op(f):
    # from functools import wraps
    # @wraps(f)
    # def wrapper(project):
    #     return f(project)
    NAME_TO_OPERATION[f.__name__] = f
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


def mk_obj(
    *, name, width, height, x, y, layer,
):
    return {
        "name": name,
        "width": width,
        "height": height,
        "x": x,
        "y": y,
        "layer": layer,
        "angle": 0,
        "customSize": True,
        "locked": False,
        "zOrder": 1,
        "numberProperties": [],
        "stringProperties": [],
        "initialVariables": [],
    }


@reg_op
def add_pause_reminders_to_levels(project):
    for layout in project["layouts"]:
        if not layout["name"].startswith("L_"):
            continue

        instances = layout["instances"]
        if any((instance["name"] == "PauseReminder" for instance in instances)):
            continue

        instances.append(
            mk_obj(name="PauseReminder", width=24, height=32, x=34, y=19, layer="UI")
        )


@reg_op
def add_transitions(project):
    for layout in project["layouts"]:
        if not layout["name"].startswith("L_"):
            continue

        instances = layout["instances"]
        if not any((instance["name"] == "Transition" for instance in instances)):
            instances.append(
                mk_obj(
                    name="Transition",
                    width=810,
                    height=610,
                    x=-5,
                    y=-5,
                    layer="Transition",
                )
            )

        layers = layout["layers"]
        if not any((layers["name"] == "Transition" for layers in layers)):
            layers.append(
                {
                    "name": "Transition",
                    "visibility": False,
                    "cameras": [],
                    "effects": [
                        {
                            "effectType": "Adjustment",
                            "name": "AlphaAdjustment",
                            "doubleParameters": {
                                "alpha": 0,
                                "blue": 0.6,
                                "brightness": 1,
                                "contrast": 1,
                                "gamma": 1,
                                "green": 1,
                                "red": 1,
                                "saturation": 2,
                            },
                            "stringParameters": {},
                            "booleanParameters": {},
                        }
                    ],
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


def main(*, operations: "str[]"):
    path_in = "./unbound.json"
    # path_in = "./unbound.refactor.json"
    path_out = "./unbound.refactor.json"

    project = None
    with open(path_in) as project_file:
        project = json.load(project_file)

    for op_name in operations:
        operation = NAME_TO_OPERATION[op_name]
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
        "operations", choices=NAME_TO_OPERATION.keys(), nargs="+",
    )

    main(**vars(parser.parse_args()))
